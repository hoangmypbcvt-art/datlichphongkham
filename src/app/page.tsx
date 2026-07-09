import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold">Phòng khám An Bình</h1>
        <p className="max-w-xl text-gray-600">
          Đặt lịch khám bệnh nhanh chóng, chọn bác sĩ và khung giờ phù hợp
          với bạn. Xác nhận lịch hẹn ngay trên hệ thống.
        </p>
        {session?.user?.role === "PATIENT" ? (
          <Link href="/dat-lich">
            <Button size="lg">Đặt lịch khám ngay</Button>
          </Link>
        ) : !session ? (
          <div className="flex gap-3">
            <Link href="/register">
              <Button size="lg">Đăng ký để đặt lịch</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Đăng nhập
              </Button>
            </Link>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Đặt lịch trực tuyến</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Chọn dịch vụ, bác sĩ và khung giờ trống chỉ trong vài bước.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đội ngũ bác sĩ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Bác sĩ giàu kinh nghiệm ở nhiều chuyên khoa khác nhau.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quản lý lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Xem, hủy hoặc theo dõi trạng thái lịch hẹn của bạn mọi lúc.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
