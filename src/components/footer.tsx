import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm">
        <p className="text-base font-semibold">{SITE.clinicName}</p>
        <p className="text-primary-foreground/80">{SITE.companyName}</p>
        <p className="text-primary-foreground/80">Địa chỉ: {SITE.address}</p>
        <p className="text-primary-foreground/80">
          Hotline:{" "}
          <a href={`tel:${SITE.hotline.replace(/\./g, "")}`} className="font-medium underline">
            {SITE.hotline}
          </a>
        </p>
      </div>
    </footer>
  );
}
