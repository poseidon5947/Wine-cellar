import { ImportClient } from "@/components/ImportClient";
import { ImportBg } from "@/components/ImportBg";

export default function ImportPage() {
  return (
    <>
      <ImportBg />
      <div className="import-page-content">
        <ImportClient />
      </div>
    </>
  );
}
