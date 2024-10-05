import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { StaffDashboardClient } from "./components/client";

const DashboardPage = async ({ params }: { params: { labId: string } }) => {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/auth/login");
  }

  const lab = await db.labaratory.findUnique({
    where: {
      id: user.labId!,
    }
  });

  if (!lab) {
    redirect("/");
  }

  return <StaffDashboardClient labId={lab.id} />;
}

export default DashboardPage;