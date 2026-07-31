import { Suspense } from "react";
import { CatalogueClient } from "@/components/CatalogueClient";

export default function CataloguePage() {
  return (
    <Suspense>
      <CatalogueClient />
    </Suspense>
  );
}
