import { prisma } from "@/lib/prisma";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminDoctorsManager } from "@/components/admin-doctors-manager";
import { AdminServicesManager } from "@/components/admin-services-manager";
import { SendRemindersButton } from "@/components/send-reminders-button";

export default async function AdminPage() {
  const [doctors, services, appointmentCounts, smsLogs] = await Promise.all([
    prisma.doctor.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    prisma.smsLog.findMany({
      include: { appointment: { include: { patient: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const totalAppointments = appointmentCounts.reduce(
    (sum, c) => sum + c._count,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">
              Tổng lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalAppointments}
          </CardContent>
        </Card>
        {appointmentCounts.map((c) => (
          <Card key={c.status}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                {c.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {c._count}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Bác sĩ</TabsTrigger>
          <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          <TabsTrigger value="sms">Nhắc lịch SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors">
          <AdminDoctorsManager doctors={doctors} />
        </TabsContent>
        <TabsContent value="services">
          <AdminServicesManager services={services} />
        </TabsContent>
        <TabsContent value="sms">
          <div className="flex flex-col gap-6">
            <SendRemindersButton />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian gửi</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smsLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.createdAt.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{log.appointment.patient.name}</TableCell>
                    <TableCell>{log.phone}</TableCell>
                    <TableCell>
                      {log.type === "CONFIRMATION" ? "Xác nhận" : "Nhắc lịch"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === "SENT" ? "default" : "destructive"}
                      >
                        {log.status === "SENT" ? "Đã gửi" : "Thất bại"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {smsLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Chưa có tin nhắn nào được gửi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
