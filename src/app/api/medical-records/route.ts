import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/uploads";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedPatientId = searchParams.get("patientId");

  let patientId: string | null = requestedPatientId;
  if (session.user.role === "PATIENT") {
    patientId = session.user.id;
  } else if (!["DOCTOR", "STAFF", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  if (!patientId) {
    return NextResponse.json({ error: "Thiếu patientId" }, { status: 400 });
  }

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    include: { uploadedBy: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (!["PATIENT", "DOCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const description = formData.get("description");
  const appointmentId = formData.get("appointmentId");
  const requestedPatientId = formData.get("patientId");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }

  const patientId =
    session.user.role === "PATIENT"
      ? session.user.id
      : typeof requestedPatientId === "string" && requestedPatientId
        ? requestedPatientId
        : null;

  if (!patientId) {
    return NextResponse.json({ error: "Thiếu patientId" }, { status: 400 });
  }

  const patient = await prisma.user.findUnique({ where: { id: patientId } });
  if (!patient || patient.role !== "PATIENT") {
    return NextResponse.json({ error: "Không tìm thấy bệnh nhân" }, { status: 404 });
  }

  let saved;
  try {
    saved = await saveUploadedFile(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      appointmentId:
        typeof appointmentId === "string" && appointmentId ? appointmentId : null,
      uploadedById: session.user.id,
      fileName: file.name,
      filePath: saved.filePath,
      fileType: saved.fileType,
      fileSize: saved.fileSize,
      description: typeof description === "string" ? description : null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
