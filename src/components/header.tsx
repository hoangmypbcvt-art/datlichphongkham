import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export async function Header() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight">
            {SITE.clinicName}
          </span>
          <span className="text-xs text-primary-foreground/75">
            {SITE.companyName}
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
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
