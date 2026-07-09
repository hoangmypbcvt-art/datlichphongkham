"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

type Doctor = {
  id: string;
  specialty: string;
  user: { name: string };
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices);
    fetch("/api/doctors")
      .then((res) => res.json())
      .then(setDoctors);
  }, []);

  useEffect(() => {
    if (!doctorId || !serviceId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/doctors/${doctorId}/slots?date=${date}&serviceId=${serviceId}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, serviceId, date]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  async function handleSubmit() {
    if (!doctorId || !serviceId || !date || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        serviceId,
        date,
        startTime: selectedSlot,
        note,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đặt lịch thất bại, vui lòng thử lại.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/lich-hen-cua-toi"), 1200);
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Đặt lịch thành công!</CardTitle>
        </CardHeader>
        <CardContent>
          Lịch hẹn của bạn đang chờ phòng khám xác nhận. Đang chuyển đến
          trang lịch hẹn của bạn...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Đặt lịch khám</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>1. Chọn dịch vụ</Label>
          <Select
            value={serviceId}
            onValueChange={(v) => {
              setServiceId(v ?? "");
              setSelectedSlot(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} phút -{" "}
                  {s.price.toLocaleString("vi-VN")}đ)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>2. Chọn bác sĩ</Label>
          <Select
            value={doctorId}
            onValueChange={(v) => {
              setDoctorId(v ?? "");
              setSelectedSlot(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn bác sĩ" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.user.name} - {d.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">3. Chọn ngày</Label>
          <Input
            id="date"
            type="date"
            min={todayISO()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot(null);
            }}
          />
        </div>

        {doctorId && serviceId && (
          <div className="flex flex-col gap-2">
            <Label>4. Chọn khung giờ</Label>
            {loadingSlots ? (
              <p className="text-sm text-gray-500">Đang tải khung giờ...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500">
                Không còn khung giờ trống trong ngày này.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={selectedSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
          <Textarea
            id="note"
            placeholder="Triệu chứng, yêu cầu khác..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          disabled={!selectedSlot || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "Đang xử lý..."
            : selectedService
            ? `Xác nhận đặt lịch - ${selectedService.price.toLocaleString(
                "vi-VN"
              )}đ`
            : "Xác nhận đặt lịch"}
        </Button>
      </CardContent>
    </Card>
  );
}
