import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusLabels, statusVariants } from "@/lib/status";
import { AppointmentStatusActions } from "@/components/appointment-status-actions";

export default async function MyAppointmentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      service: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch hẹn của tôi</h1>
        <Link href="/dat-lich">
          <Button>Đặt lịch mới</Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="text-gray-600">Bạn chưa có lịch hẹn nào.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {a.service.name} với {a.doctor.user.name}
                </CardTitle>
                <Badge variant={statusVariants[a.status]}>
                  {statusLabels[a.status]}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  Ngày {a.date} lúc {a.startTime} - {a.endTime}
                </p>
                {a.note && (
                  <p className="text-sm text-gray-500">Ghi chú: {a.note}</p>
                )}
                {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                  <AppointmentStatusActions
                    appointmentId={a.id}
                    actions={[
                      {
                        label: "Hủy lịch",
                        status: "CANCELLED",
                        variant: "destructive",
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
