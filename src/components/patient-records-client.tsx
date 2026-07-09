"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicalRecordUploadForm } from "@/components/medical-record-upload-form";
import { MedicalRecordList } from "@/components/medical-record-list";

export function PatientRecordsClient({ patientId }: { patientId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tải lên hồ sơ mới</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicalRecordUploadForm
            patientId={patientId}
            onUploaded={() => setRefreshKey((k) => k + 1)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ đã tải lên</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicalRecordList
            patientId={patientId}
            canDelete
            refreshKey={refreshKey}
          />
        </CardContent>
      </Card>
    </div>
  );
}
