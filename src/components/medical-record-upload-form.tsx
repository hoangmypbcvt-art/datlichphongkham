"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MedicalRecordUploadForm({
  patientId,
  appointmentId,
  onUploaded,
}: {
  patientId: string;
  appointmentId?: string;
  onUploaded?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn file.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("patientId", patientId);
    if (appointmentId) formData.set("appointmentId", appointmentId);
    if (description) formData.set("description", description);

    const res = await fetch("/api/medical-records", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload thất bại.");
      return;
    }

    setFile(null);
    setDescription("");
    onUploaded?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="record-file">Chọn file (PDF, JPG, PNG - tối đa 10MB)</Label>
        <Input
          id="record-file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="record-description">Mô tả (không bắt buộc)</Label>
        <Input
          id="record-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ví dụ: Kết quả xét nghiệm máu"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang tải lên..." : "Tải lên hồ sơ"}
      </Button>
    </form>
  );
}
