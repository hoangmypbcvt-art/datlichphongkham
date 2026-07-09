import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { SITE } from "@/lib/site";

export async function POST() {
  const session = await auth();
  if (!session?.user || !["STAFF", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);

  const appointments = await prisma.appointment.findMany({
    where: {
      date,
      status: "CONFIRMED",
      smsLogs: { none: { type: "REMINDER" } },
    },
    include: {
      patient: { select: { name: true, phone: true } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  });

  let sent = 0;
  for (const appointment of appointments) {
    if (!appointment.patient.phone) continue;
    await sendSms({
      appointmentId: appointment.id,
      phone: appointment.patient.phone,
      message: `Nhắc lịch: bạn có lịch khám với BS. ${appointment.doctor.user.name} vào ${appointment.startTime} ngày mai (${appointment.date}) tại ${SITE.clinicName}.`,
      type: "REMINDER",
    });
    sent++;
  }

  return NextResponse.json({ date, total: appointments.length, sent });
}
