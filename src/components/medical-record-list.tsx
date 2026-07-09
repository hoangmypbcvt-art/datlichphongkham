"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MedicalRecord = {
  id: string;
  fileName: string;
  description: string | null;
  createdAt: string;
  uploadedBy: { name: string; role: string };
};

export function MedicalRecordList({
  patientId,
  canDelete = false,
  refreshKey,
}: {
  patientId: string;
  canDelete?: boolean;
  refreshKey?: number;
}) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadRecords() {
      setLoading(true);
      try {
        const res = await fetch(`/api/medical-records?patientId=${patientId}`);
        const data = await res.json();
        if (!cancelled) setRecords(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRecords();
    return () => {
      cancelled = true;
    };
  }, [patientId, refreshKey, reloadToken]);

  async function handleDelete(id: string) {
    if (!confirm("Xóa hồ sơ này?")) return;
    const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
    if (res.ok) setReloadToken((k) => k + 1);
  }

  if (loading) return <p className="text-sm text-gray-500">Đang tải...</p>;
  if (records.length === 0)
    return <p className="text-sm text-gray-500">Chưa có hồ sơ nào.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên file</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Người tải lên</TableHead>
          <TableHead>Ngày</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <a
                href={`/api/medical-records/${r.id}/download`}
                className="underline"
              >
                {r.fileName}
              </a>
            </TableCell>
            <TableCell>{r.description ?? "-"}</TableCell>
            <TableCell>{r.uploadedBy.name}</TableCell>
            <TableCell>
              {new Date(r.createdAt).toLocaleDateString("vi-VN")}
            </TableCell>
            <TableCell>
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(r.id)}
                >
                  Xóa
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
