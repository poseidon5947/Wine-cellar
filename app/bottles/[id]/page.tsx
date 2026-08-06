import { BottleForm } from "@/components/BottleForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBottlePage({ params }: Props) {
  const { id } = await params;
  return <BottleForm mode="edit" bottleId={id} />;
}
