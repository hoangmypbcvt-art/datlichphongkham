import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ" }, { status: 404 });
  }

  const canView =
    (session.user.role === "PATIENT" && record.patientId === session.user.id) ||
    ["DOCTOR", "STAFF", "ADMIN"].includes(session.user.role);
  if (!canView) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const result = await get(record.filePath, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!result?.stream) {
    return NextResponse.json({ error: "Không tìm thấy file" }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": record.fileType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(record.fileName)}"`,
    },
  });
}
