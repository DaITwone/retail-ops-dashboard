import { getShiftSchedule } from "./action";
import ShiftsClient from "./ShiftsClient";

export default async function ShiftsPage() {
  const schedule = await getShiftSchedule();

  return <ShiftsClient initialData={schedule} />;
}
