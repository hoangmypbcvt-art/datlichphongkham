import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          Phòng khám An Bình
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {role === "PATIENT" && (
            <>
              <Link href="/dat-lich">Đặt lịch</Link>
              <Link href="/lich-hen-cua-toi">Lịch của tôi</Link>
              <Link href="/ho-so-benh-an">Hồ sơ bệnh án</Link>
            </>
          )}
          {(role === "STAFF" || role === "ADMIN") && (
            <Link href="/staff">Lễ tân</Link>
          )}
          {(role === "DOCTOR" || role === "ADMIN") && (
            <Link href="/doctor">Bác sĩ</Link>
          )}
          {role === "ADMIN" && <Link href="/admin">Quản trị</Link>}

          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Đăng xuất ({session.user?.name})
              </Button>
            </form>
          ) : (
            <>
              <Link href="/login">Đăng nhập</Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
