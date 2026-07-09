import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "Thiếu tham số date hoặc serviceId" },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }

  const slots = await getAvailableSlots(id, date, service.durationMinutes);
  return NextResponse.json({ slots });
}
