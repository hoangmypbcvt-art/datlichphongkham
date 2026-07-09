import { prisma } from "./prisma";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAvailableSlots(
  doctorId: string,
  date: string,
  durationMinutes: number
) {
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId, dayOfWeek },
  });

  if (schedules.length === 0) return [];

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: { not: "CANCELLED" },
    },
  });

  const busyRanges = existingAppointments.map((a) => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime),
  }));

  const slots: string[] = [];

  for (const schedule of schedules) {
    let cursor = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);

    while (cursor + durationMinutes <= end) {
      const slotEnd = cursor + durationMinutes;
      const overlaps = busyRanges.some(
        (range) => cursor < range.end && slotEnd > range.start
      );
      if (!overlaps) {
        slots.push(minutesToTime(cursor));
      }
      cursor += durationMinutes;
    }
  }

  return slots;
}

export { timeToMinutes, minutesToTime };
