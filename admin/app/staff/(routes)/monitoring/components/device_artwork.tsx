"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ActiveDeviceUser, Device, DeviceUser, State } from "@prisma/client"
import { getDeviceUserById } from "@/data/user"
import { getDeviceById } from "@/data/device"
import { logoutUser } from "@/actions/logout"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import toast from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface DeviceArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  activeDevice?: ActiveDeviceUser
  inactiveDevice?: Device
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
  onChanged: () => void
}

export function DeviceArtwork({
  activeDevice,
  inactiveDevice,
  aspectRatio = "portrait",
  width,
  height,
  onChanged,
  className,
  ...props
}: DeviceArtworkProps) {

  const router = useRouter()

  const [user, setUser] = useState<DeviceUser | null>()
  const [device, setDevice] = useState<Device | null>()
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      if (activeDevice) {
        const user = await getDeviceUserById(activeDevice.userId);
        setUser(user)
      }
      const device = await getDeviceById(activeDevice ? activeDevice.deviceId : inactiveDevice ? inactiveDevice.id : '');
      setDevice(device)
    }
    startTransition(() => {
      fetchData();
    })

  }, [activeDevice, inactiveDevice]);

  return (
    <>
      {<div className={cn("space-y-3 flex flex-col items-center ", className)} {...props}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="overflow-hidden rounded-md">
              {isPending ? <Skeleton className="h-40 w-40" /> : <Image
                src={!activeDevice ? "/preferences-desktop-display.png" : "/preferences-desktop-display-blue.png"}
                alt={""}
                width={width}
                height={height}
                className={cn(
                  "h-auto w-auto object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}
              />}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className={cn("w-40", inactiveDevice && "hidden", { ...props })}>
            <ContextMenuItem
              onClick={() =>
                router.push(`/staff/monitoring/${device?.id}`)
              }>
              Monitor
            </ContextMenuItem>
            <ContextMenuItem>Shutdown (beta)</ContextMenuItem>
            <ContextMenuItem>Bootup (beta)</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Screenshot</ContextMenuItem>
            <ContextMenuItem onClick={() =>
              router.push(`/staff/monitoring/${user?.id}/activitylogs`)
            }>View Activity Log</ContextMenuItem>
            <ContextMenuItem>View Power Log</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Restrict</ContextMenuItem>
            <ContextMenuItem>Block</ContextMenuItem>

            <ContextMenuItem
              onClick={() => {
                if (activeDevice)
                  logoutUser(activeDevice.userId, activeDevice.deviceId).then((message) => {
                    toast.success(message.success)
                    onChanged()
                  })
              }}>
              Logout
            </ContextMenuItem>
          </ContextMenuContent>

        </ContextMenu>

        <div className="space-y-1 text-sm text-center">
          {isPending ? <Skeleton className="h-4 w-40" /> : <h3 className="font-medium leading-none">{device?.name}</h3>}

          {activeDevice && (isPending ? <Skeleton className="h-4 w-30" /> : <p className="text-xs text-muted-foreground">{user?.firstName} {user?.lastName}</p>)}
        </div>
      </div>}
    </>
  )
}