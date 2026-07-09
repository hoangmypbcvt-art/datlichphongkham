import Link from "next/link";
import { CalendarCheck, Stethoscope, ClipboardList, Phone } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/site";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-start gap-5 rounded-2xl border bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium tracking-wide uppercase">
          {SITE.companyName}
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {SITE.clinicName}
        </h1>
        <p className="max-w-xl text-primary-foreground/85">
          Đặt lịch khám bệnh nhanh chóng, chọn bác sĩ và khung giờ phù hợp
          với bạn. Xác nhận lịch hẹn ngay trên hệ thống.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {session?.user?.role === "PATIENT" ? (
            <Link href="/dat-lich">
              <Button size="lg" variant="secondary" className="text-secondary-foreground">
                Đặt lịch khám ngay
              </Button>
            </Link>
          ) : !session ? (
            <>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-secondary-foreground">
                  Đăng ký để đặt lịch
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Đăng nhập
                </Button>
              </Link>
            </>
          ) : null}
          <a
            href={`tel:${SITE.hotline.replace(/\./g, "")}`}
            className="flex items-center gap-2 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground"
          >
            <Phone className="size-4" />
            Hotline: {SITE.hotline}
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <CalendarCheck className="size-5 text-primary" />
            <CardTitle>Đặt lịch trực tuyến</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Chọn dịch vụ, bác sĩ và khung giờ trống chỉ trong vài bước.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Stethoscope className="size-5 text-primary" />
            <CardTitle>Đội ngũ bác sĩ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Bác sĩ giàu kinh nghiệm ở nhiều chuyên khoa y học cổ truyền.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <ClipboardList className="size-5 text-primary" />
            <CardTitle>Quản lý lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Xem, hủy hoặc theo dõi trạng thái lịch hẹn của bạn mọi lúc.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
