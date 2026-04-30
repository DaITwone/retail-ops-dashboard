import { getStaffList } from "./action";
import StaffClient from "./StaffClient";

export default async function StaffPage() {
  const staffList = await getStaffList();

  return <StaffClient initialData={staffList} />;
}