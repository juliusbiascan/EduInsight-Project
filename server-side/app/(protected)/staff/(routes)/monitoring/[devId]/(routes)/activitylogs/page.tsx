import { auth } from "@/auth"
import { Heading } from "@/components/ui/heading"
import { db } from "@/lib/db"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { redirect } from "next/navigation"
import { ActivityLogsClient } from "./components/client"

const ActivityLogsPage = async ({
  params
}: {
  params: { devId: string }
}) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const activityLogs = await db.activityLogs.findMany({
    where: {
      userId: params.devId,
    }, orderBy: {
      createdAt: "desc"
    }
  })

  if (!activityLogs) {
    return (
      <div className="w-full flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          No Activity Found!
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ActivityLogsClient data={activityLogs} />
      </div>
    </div>

  );
}

export default ActivityLogsPage;