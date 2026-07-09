import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(doctors);
}

const createDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  specialty: z.string().min(2),
  bio: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { name, email, password, specialty, bio } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const doctor = await prisma.doctor.create({
    data: {
      specialty,
      bio,
      user: {
        create: { name, email, passwordHash, role: "DOCTOR" },
      },
      schedules: {
        create: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
          dayOfWeek,
          startTime: "08:00",
          endTime: "17:00",
        })),
      },
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(doctor, { status: 201 });
}
