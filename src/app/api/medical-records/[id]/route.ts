import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile } from "@/lib/uploads";

export async function DELETE(
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

  const isOwner =
    session.user.role === "PATIENT" && record.patientId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  await prisma.medicalRecord.delete({ where: { id } });
  await deleteUploadedFile(record.filePath).catch(() => {});

  return NextResponse.json({ ok: true });
}
