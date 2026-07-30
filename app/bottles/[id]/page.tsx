import { BottleForm } from "@/components/BottleForm";
import { BottleBg } from "@/components/BottleBg";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBottlePage({ params }: Props) {
  const { id } = await params;
  return (
    <>
      <BottleBg />
      <div className="bottle-page-content">
        <BottleForm mode="edit" bottleId={id} />
      </div>
    </>
  );
}
