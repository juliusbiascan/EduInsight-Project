"use client"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { ActivityLogs } from "@prisma/client"
import { useEffect } from "react"

interface ActivityLogsClientProps {
  data: ActivityLogs[]
}

export const ActivityLogsClient: React.FC<ActivityLogsClientProps> = ({
  data
}) => {

  // const router = useRouter();

  // useEffect(() => {
  //   ws.emit("join-server", "test");
  //   ws.on("update-ui", (error: any, result: any) => {
  //     console.log(result);
  //     router.refresh();
  //   })
  // }, [router]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Activity Logs`}
          description="View Power Logs of this lab" />
      </div>
      <Separator />
      <div className="grid grid-cols-4 gap-2 font-bold">
        <div>Timestamp</div>
        <div>Window Name</div>
        <div>Window Class</div>
      </div>
      {data.map((item) => (
        <div className="grid grid-cols-4 gap-2 border border-grey" key={item.id} >
          <div>{item.al_log_ts}</div>
          <div>{item.windowName}</div>
          <div>{item.windowClass}</div>
        </div>
      ))}
    </>
  )
}