import { ShareCatalogueClient } from "@/components/ShareCatalogueClient";
import { CatalogueBg } from "@/components/CatalogueBg";

export default function SharePage() {
  return (
    <>
      <CatalogueBg />
      <div className="catalogue-page-content">
        <ShareCatalogueClient />
      </div>
    </>
  );
}
