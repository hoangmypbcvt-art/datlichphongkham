import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusLabels, statusVariants } from "@/lib/status";
import { AppointmentStatusActions } from "@/components/appointment-status-actions";
import { StaffBookingDialog } from "@/components/staff-booking-dialog";
import { StaffRecordDialog } from "@/components/staff-record-dialog";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  const appointments = await prisma.appointment.findMany({
    where: date ? { date } : {},
    include: {
      patient: { select: { name: true, phone: true } },
      doctor: { include: { user: { select: { name: true } } } },
      service: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý lịch hẹn</h1>
        <StaffBookingDialog />
      </div>

      <form className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600" htmlFor="date">
            Lọc theo ngày
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={date}
            className="rounded-md border px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          Lọc
        </button>
        {date && (
          <a href="/staff" className="text-sm text-gray-500 underline">
            Xóa lọc
          </a>
        )}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày giờ</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>Bác sĩ</TableHead>
            <TableHead>Dịch vụ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                {a.date} {a.startTime}
              </TableCell>
              <TableCell>
                {a.patient.name}
                <div className="text-xs text-gray-500">{a.patient.phone}</div>
                <div className="mt-1">
                  <StaffRecordDialog
                    patientId={a.patientId}
                    patientName={a.patient.name}
                  />
                </div>
              </TableCell>
              <TableCell>{a.doctor.user.name}</TableCell>
              <TableCell>{a.service.name}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[a.status]}>
                  {statusLabels[a.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {a.status === "PENDING" && (
                  <AppointmentStatusActions
                    appointmentId={a.id}
                    actions={[
                      { label: "Xác nhận", status: "CONFIRMED" },
                      {
                        label: "Hủy",
                        status: "CANCELLED",
                        variant: "destructive",
                      },
                    ]}
                  />
                )}
                {a.status === "CONFIRMED" && (
                  <AppointmentStatusActions
                    appointmentId={a.id}
                    actions={[
                      {
                        label: "Hủy",
                        status: "CANCELLED",
                        variant: "destructive",
                      },
                    ]}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
          {appointments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                Không có lịch hẹn nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
