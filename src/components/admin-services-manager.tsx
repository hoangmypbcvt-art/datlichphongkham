"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export function AdminServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", durationMinutes: "30", price: "0" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Thêm dịch vụ thất bại.");
      return;
    }
    setForm({ name: "", durationMinutes: "30", price: "0" });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa dịch vụ này?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm dịch vụ mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <div className="flex flex-col gap-2">
              <Label>Tên dịch vụ</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Thời lượng (phút)</Label>
              <Input
                type="number"
                min={5}
                required
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationMinutes: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Giá (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 sm:col-span-3">{error}</p>
            )}
            <div className="sm:col-span-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang thêm..." : "Thêm dịch vụ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên dịch vụ</TableHead>
            <TableHead>Thời lượng</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.durationMinutes} phút</TableCell>
              <TableCell>{s.price.toLocaleString("vi-VN")}đ</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(s.id)}
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
