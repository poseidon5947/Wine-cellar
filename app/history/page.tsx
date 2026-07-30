import { HistoryBg } from "@/components/HistoryBg";
import { HistoryClient } from "@/components/HistoryClient";

export default function HistoryPage() {
  return (
    <>
      <HistoryBg />
      <div className="catalogue-page-content">
        <HistoryClient />
      </div>
    </>
  );
}
