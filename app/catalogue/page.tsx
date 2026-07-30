import { CatalogueClient } from "@/components/CatalogueClient";
import { CatalogueBg } from "@/components/CatalogueBg";
import { Suspense } from "react";

export default function CataloguePage() {
  return (
    <>
      <CatalogueBg />
      <div className="catalogue-page-content">
        <Suspense fallback={null}>
          <CatalogueClient />
        </Suspense>
      </div>
    </>
  );
}
