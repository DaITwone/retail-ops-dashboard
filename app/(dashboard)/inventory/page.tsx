import { getInventoryProducts } from "./action";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const products = await getInventoryProducts();
  return <InventoryClient initialProducts={products} />;
}