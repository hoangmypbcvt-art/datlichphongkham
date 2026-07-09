import { auth } from "@/lib/auth";
import { PatientRecordsClient } from "@/components/patient-records-client";

export default async function MedicalRecordsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Hồ sơ bệnh án</h1>
      <PatientRecordsClient patientId={session.user.id} />
    </div>
  );
}
