"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Service = { id: string; name: string };
type Doctor = { id: string; specialty: string; user: { name: string } };

export function StaffBookingDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/services").then((r) => r.json()).then(setServices);
    fetch("/api/doctors").then((r) => r.json()).then(setDoctors);
  }, [open]);

  useEffect(() => {
    setSelectedSlot(null);
    if (!doctorId || !serviceId || !date) {
      setSlots([]);
      return;
    }
    fetch(`/api/doctors/${doctorId}/slots?date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [doctorId, serviceId, date]);

  async function handleSubmit() {
    setError(null);
    if (!doctorId || !serviceId || !selectedSlot || !name || !email) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        serviceId,
        date,
        startTime: selectedSlot,
        newPatient: { name, email, phone: phone || undefined },
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Tạo lịch hẹn thất bại.");
      return;
    }

    setOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setSelectedSlot(null);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tạo lịch hẹn cho khách</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo lịch hẹn walk-in</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Tên khách hàng</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Số điện thoại</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Dịch vụ</Label>
            <Select value={serviceId} onValueChange={(v) => setServiceId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Bác sĩ</Label>
            <Select value={doctorId} onValueChange={(v) => setDoctorId(v ?? "")}>
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
            <Label>Ngày</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {doctorId && serviceId && (
            <div className="flex flex-col gap-2">
              <Label>Khung giờ</Label>
              <div className="grid grid-cols-4 gap-2">
                {slots.length === 0 && (
                  <p className="col-span-4 text-sm text-gray-500">
                    Không còn khung giờ trống.
                  </p>
                )}
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    size="sm"
                    variant={selectedSlot === slot ? "default" : "outline"}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Tạo lịch hẹn"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
