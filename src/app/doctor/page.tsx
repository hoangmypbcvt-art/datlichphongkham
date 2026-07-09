import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusLabels, statusVariants } from "@/lib/status";
import { AppointmentStatusActions } from "@/components/appointment-status-actions";
import { DoctorRecordDialog } from "@/components/doctor-record-dialog";

export default async function DoctorPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctor) {
    return <p>Không tìm thấy hồ sơ bác sĩ.</p>;
  }

  const { date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const filterDate = date ?? today;

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id, date: filterDate },
    include: {
      patient: { select: { name: true, phone: true } },
      service: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Lịch khám của tôi</h1>

      <form className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600" htmlFor="date">
            Chọn ngày
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={filterDate}
            className="rounded-md border px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          Xem
        </button>
      </form>

      {appointments.length === 0 ? (
        <p className="text-gray-600">Không có lịch khám trong ngày này.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {a.startTime} - {a.endTime} · {a.patient.name}
                </CardTitle>
                <Badge variant={statusVariants[a.status]}>
                  {statusLabels[a.status]}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  Dịch vụ: {a.service.name} · SĐT: {a.patient.phone}
                </p>
                {a.note && (
                  <p className="text-sm text-gray-500">Ghi chú: {a.note}</p>
                )}
                <div className="flex items-center gap-2">
                  {a.status === "CONFIRMED" && (
                    <AppointmentStatusActions
                      appointmentId={a.id}
                      actions={[{ label: "Đánh dấu hoàn thành", status: "COMPLETED" }]}
                    />
                  )}
                  {(a.status === "CONFIRMED" || a.status === "COMPLETED") && (
                    <DoctorRecordDialog
                      patientId={a.patientId}
                      patientName={a.patient.name}
                      appointmentId={a.id}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
