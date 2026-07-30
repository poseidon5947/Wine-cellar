import { BottleForm } from "@/components/BottleForm";
import { BottleBg } from "@/components/BottleBg";

export default function NewBottlePage() {
  return (
    <>
      <BottleBg />
      <div className="bottle-page-content">
        <BottleForm mode="create" />
      </div>
    </>
  );
}
