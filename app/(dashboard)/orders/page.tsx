import { getOrdersPageData } from "./action";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const data = await getOrdersPageData();

  return <OrdersClient initialData={data} />;
}
