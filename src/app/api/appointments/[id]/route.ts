import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { name: true, phone: true } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Không tìm thấy lịch hẹn" }, { status: 404 });
  }

  const { role, id: userId } = session.user;
  const { status } = parsed.data;

  if (role === "PATIENT") {
    if (appointment.patientId !== userId || status !== "CANCELLED") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }
  } else if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor || doctor.id !== appointment.doctorId || status !== "COMPLETED") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }
  } else if (!["STAFF", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  if (status === "CONFIRMED" && appointment.patient.phone) {
    await sendSms({
      appointmentId: appointment.id,
      phone: appointment.patient.phone,
      message: `Lịch khám của bạn với BS. ${appointment.doctor.user.name} vào ${appointment.startTime} ngày ${appointment.date} đã được xác nhận. Phòng khám An Bình.`,
      type: "CONFIRMATION",
    });
  }

  return NextResponse.json(updated);
}
