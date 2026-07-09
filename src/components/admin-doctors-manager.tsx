"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type Doctor = {
  id: string;
  specialty: string;
  bio: string | null;
  user: { name: string; email: string };
};

export function AdminDoctorsManager({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Thêm bác sĩ thất bại.");
      return;
    }
    setForm({ name: "", email: "", password: "", specialty: "", bio: "" });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa bác sĩ này?")) return;
    const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm bác sĩ mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-2">
              <Label>Họ tên</Label>
              <Input required value={form.name} onChange={update("name")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Chuyên khoa</Label>
              <Input
                required
                value={form.specialty}
                onChange={update("specialty")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email đăng nhập</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                minLength={6}
                required
                value={form.password}
                onChange={update("password")}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Giới thiệu (không bắt buộc)</Label>
              <Textarea value={form.bio} onChange={update("bio")} />
            </div>
            {error && (
              <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang thêm..." : "Thêm bác sĩ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Chuyên khoa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.user.name}</TableCell>
              <TableCell>{d.specialty}</TableCell>
              <TableCell>{d.user.email}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(d.id)}
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
