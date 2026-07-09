import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@phongkham.vn" },
    update: {},
    create: {
      email: "admin@phongkham.vn",
      passwordHash,
      name: "Quản trị viên",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "letan@phongkham.vn" },
    update: {},
    create: {
      email: "letan@phongkham.vn",
      passwordHash,
      name: "Lễ tân Mai",
      role: "STAFF",
    },
  });

  const doctorUser1 = await prisma.user.upsert({
    where: { email: "bacsi.an@phongkham.vn" },
    update: {},
    create: {
      email: "bacsi.an@phongkham.vn",
      passwordHash,
      name: "BS. Nguyễn Văn An",
      role: "DOCTOR",
    },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { email: "bacsi.binh@phongkham.vn" },
    update: {},
    create: {
      email: "bacsi.binh@phongkham.vn",
      passwordHash,
      name: "BS. Trần Thị Bình",
      role: "DOCTOR",
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      specialty: "Nội tổng quát",
      bio: "10 năm kinh nghiệm khám nội tổng quát.",
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      specialty: "Nhi khoa",
      bio: "Chuyên khám và điều trị cho trẻ em.",
    },
  });

  for (const doctorId of [doctor1.id, doctor2.id]) {
    await prisma.doctorSchedule.deleteMany({ where: { doctorId } });
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId,
          dayOfWeek,
          startTime: "08:00",
          endTime: "17:00",
        },
      });
    }
  }

  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        { name: "Khám tổng quát", durationMinutes: 30, price: 200000 },
        { name: "Khám chuyên khoa", durationMinutes: 45, price: 350000 },
        { name: "Tái khám", durationMinutes: 20, price: 100000 },
      ],
    });
  }

  console.log("Đã tạo dữ liệu mẫu:");
  console.log("Admin:", admin.email, "/ mật khẩu: 123456");
  console.log("Lễ tân:", staff.email, "/ mật khẩu: 123456");
  console.log("Bác sĩ 1:", doctorUser1.email, "/ mật khẩu: 123456");
  console.log("Bác sĩ 2:", doctorUser2.email, "/ mật khẩu: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
