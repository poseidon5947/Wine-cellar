import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BottleLabelPage({ params }: Props) {
  const { id } = await params;
  const bottle = await prisma.bottle.findUnique({
    where: { id },
    select: { producer: true, wineName: true, vintage: true, storageLocation: true }
  });

  if (!bottle) notFound();

  return (
    <div className="print-label-page">
      <style>{`
        header, .orb, canvas { display: none !important; }
        main { max-width: none !important; padding: 0 !important; }
        body { background: #ffffff !important; color: #140c0d !important; }
        .print-label-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #ffffff;
          color: #140c0d;
          font-family: Arial, Helvetica, sans-serif;
        }
        .shelf-label {
          width: 50mm;
          height: 30mm;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 18mm 1fr;
          gap: 2.5mm;
          align-items: center;
          border: 1px solid #140c0d;
          padding: 2.5mm;
          background: #ffffff;
        }
        .shelf-label img { width: 18mm; height: 18mm; }
        .label-producer { margin: 0; font-size: 9pt; font-weight: 700; line-height: 1.1; }
        .label-wine { margin: 1mm 0 0; font-size: 7pt; line-height: 1.15; }
        .label-meta { margin: 1.5mm 0 0; font-size: 6pt; color: #444444; }
        .print-action { margin-top: 16px; }
        @media print {
          @page { size: 50mm 30mm; margin: 0; }
          .print-label-page { min-height: 30mm; display: block; }
          .shelf-label { border: 0; }
          .print-action { display: none; }
        }
      `}</style>
      <div>
        <section className="shelf-label">
          <img src={`/api/bottles/${id}/qr`} alt="" />
          <div>
            <p className="label-producer">{bottle.producer}</p>
            <p className="label-wine">{bottle.wineName}</p>
            <p className="label-meta">{[bottle.vintage, bottle.storageLocation].filter(Boolean).join(" / ")}</p>
          </div>
        </section>
        <p className="print-action">Use browser print to print this label</p>
      </div>
    </div>
  );
}
