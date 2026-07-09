import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeToMinutes, minutesToTime } from "@/lib/slots";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  const where: Record<string, unknown> = {};
  if (date) where.date = date;

  if (session.user.role === "PATIENT") {
    where.patientId = session.user.id;
  } else if (session.user.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor) return NextResponse.json([]);
    where.doctorId = doctor.id;
  }
  // STAFF and ADMIN see all appointments (optionally filtered by date)

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { name: true, phone: true, email: true } },
      doctor: { include: { user: { select: { name: true } } } },
      service: { select: { name: true, durationMinutes: true, price: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(appointments);
}

const createAppointmentSchema = z.object({
  doctorId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  startTime: z.string(),
  note: z.string().optional(),
  patientId: z.string().optional(),
  newPatient: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(8).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (!["PATIENT", "STAFF", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { doctorId, serviceId, date, startTime, note } = parsed.data;

  let patientId: string | undefined =
    session.user.role === "PATIENT"
      ? session.user.id
      : parsed.data.patientId;

  if (
    !patientId &&
    parsed.data.newPatient &&
    ["STAFF", "ADMIN"].includes(session.user.role)
  ) {
    const { name, email, phone } = parsed.data.newPatient;
    const existingPatient = await prisma.user.findUnique({ where: { email } });
    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(2, 10),
        10
      );
      const created = await prisma.user.create({
        data: { name, email, phone, passwordHash, role: "PATIENT" },
      });
      patientId = created.id;
    }
  }

  if (!patientId) {
    return NextResponse.json(
      { error: "Thiếu thông tin bệnh nhân" },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }

  const endTime = minutesToTime(
    timeToMinutes(startTime) + service.durationMinutes
  );

  const overlapping = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date,
      status: { not: "CANCELLED" },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (overlapping) {
    return NextResponse.json(
      { error: "Khung giờ này vừa có người đặt, vui lòng chọn giờ khác" },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      serviceId,
      patientId,
      date,
      startTime,
      endTime,
      note,
      status: "PENDING",
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
