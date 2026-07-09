"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AppointmentStatusActions({
  appointmentId,
  actions,
}: {
  appointmentId: string;
  actions: { label: string; status: string; variant?: "default" | "outline" | "destructive" }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          size="sm"
          variant={action.variant ?? "outline"}
          disabled={loading !== null}
          onClick={() => updateStatus(action.status)}
        >
          {loading === action.status ? "..." : action.label}
        </Button>
      ))}
    </div>
  );
}
