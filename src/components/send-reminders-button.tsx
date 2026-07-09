"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SendRemindersButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/reminders/run", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setResult(data.error ?? "Gửi nhắc lịch thất bại.");
      return;
    }

    setResult(
      `Đã gửi ${data.sent}/${data.total} tin nhắc lịch cho ngày ${data.date}.`
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi nhắc lịch cho ngày mai"}
      </Button>
      {result && <p className="text-sm text-gray-600">{result}</p>}
    </div>
  );
}
