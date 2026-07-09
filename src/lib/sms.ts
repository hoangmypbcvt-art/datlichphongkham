import { prisma } from "./prisma";

export async function sendSms(params: {
  appointmentId: string;
  phone: string;
  message: string;
  type: "CONFIRMATION" | "REMINDER";
}) {
  const { appointmentId, phone, message, type } = params;

  // TODO: khi có tài khoản nhà cung cấp SMS thật (eSMS.vn, Twilio...),
  // thay đoạn console.log bên dưới bằng lệnh gọi API thật dùng biến môi trường
  // (ví dụ SMS_PROVIDER_API_KEY). Phần gọi sendSms() ở nơi khác không cần đổi.
  console.log(`[SMS -> ${phone}] ${message}`);

  await prisma.smsLog.create({
    data: { appointmentId, phone, message, type, status: "SENT" },
  });
}
