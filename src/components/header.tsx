import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export async function Header() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-2 px-4 py-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-nhat-tam.png"
            alt={SITE.clinicName}
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-full object-cover"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-primary-foreground/75">
              {SITE.companyName}
            </span>
            <span className="text-lg font-bold tracking-tight">
              {SITE.clinicName}
            </span>
          </span>
        </Link>
        <span className="hidden text-center text-sm font-semibold tracking-wide text-primary-foreground/90 md:block">
          TRANG ĐẶT LỊCH KHÁM
        </span>
        <nav className="flex items-center justify-start gap-5 text-sm font-medium md:justify-end">
          {role === "PATIENT" && (
            <>
              <Link href="/dat-lich" className="hover:opacity-80">
                Đặt lịch
              </Link>
              <Link href="/lich-hen-cua-toi" className="hover:opacity-80">
                Lịch của tôi
              </Link>
              <Link href="/ho-so-benh-an" className="hover:opacity-80">
                Hồ sơ bệnh án
              </Link>
            </>
          )}
          {(role === "STAFF" || role === "ADMIN") && (
            <Link href="/staff" className="hover:opacity-80">
              Lễ tân
            </Link>
          )}
          {(role === "DOCTOR" || role === "ADMIN") && (
            <Link href="/doctor" className="hover:opacity-80">
              Bác sĩ
            </Link>
          )}
          {role === "ADMIN" && (
            <Link href="/admin" className="hover:opacity-80">
              Quản trị
            </Link>
          )}

          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="text-secondary-foreground"
              >
                Đăng xuất ({session.user?.name})
              </Button>
            </form>
          ) : (
            <>
              <Link href="/login" className="hover:opacity-80">
                Đăng nhập
              </Link>
              <Link href="/register">
                <Button size="sm" variant="secondary" className="text-secondary-foreground">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
