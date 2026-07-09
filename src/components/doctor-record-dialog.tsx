"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MedicalRecordUploadForm } from "@/components/medical-record-upload-form";
import { MedicalRecordList } from "@/components/medical-record-list";

export function DoctorRecordDialog({
  patientId,
  patientName,
  appointmentId,
}: {
  patientId: string;
  patientName: string;
  appointmentId: string;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline">Hồ sơ bệnh án</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hồ sơ bệnh án - {patientName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <MedicalRecordList patientId={patientId} refreshKey={refreshKey} />
          <MedicalRecordUploadForm
            patientId={patientId}
            appointmentId={appointmentId}
            onUploaded={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
