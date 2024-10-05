"use server"

import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { State } from "@prisma/client";

export async function getPreviousStats(labId: string, dateRange: DateRange): Promise<{
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
}> {
  const previousFrom = subDays(dateRange.from!, 1);
  const previousTo = subDays(dateRange.to!, 1);

  const [totalLogins, totalUsers, totalDevices, activeNow] = await Promise.all([
    db.activeUserLogs.count({
      where: {
        labId: labId,
        createdAt: {
          gte: previousFrom,
          lte: previousTo,
        },
      },
    }),
    db.deviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
      },
    }),
    db.device.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
      },
    }),
    db.activeDeviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
        state: State.ACTIVE,
      },
    }),
  ]);

  return {
    totalLogins,
    totalUsers,
    totalDevices,
    activeNow,
  };
}
