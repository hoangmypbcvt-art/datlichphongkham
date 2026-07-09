"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MedicalRecordList } from "@/components/medical-record-list";

export function StaffRecordDialog({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline">Xem hồ sơ</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hồ sơ bệnh án - {patientName}</DialogTitle>
        </DialogHeader>
        <MedicalRecordList patientId={patientId} />
      </DialogContent>
    </Dialog>
  );
}
