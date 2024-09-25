"use client"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { PowerMonitoringLogs } from "@prisma/client"
import { LogItem } from "./log-item"
import { useEffect } from "react"
// import { ws } from "@/lib/ws"

interface PowerLogClientProps {
  data: PowerMonitoringLogs[]
}

export const PowerLogClient: React.FC<PowerLogClientProps> = ({
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
          title={`Power Monitoring Logs`}
          description="View Power Logs of this lab" />
      </div>
      <Separator />
      <div className="grid grid-cols-4 gap-4 font-bold">
        <div>Timestamp</div>
        <div>Power State</div>
        <div>User</div>
        <div>Device</div>
      </div>
      {data.map((pm) => (
        <LogItem key={pm.id} item={pm} />
      ))}
    </>
  )
}