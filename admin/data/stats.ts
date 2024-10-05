"use server"

import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";
import { addDays } from 'date-fns';
import { State } from "@prisma/client";

export async function getPreviousStats(labId: string): Promise<{
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
}> {
  const previousDateRange: DateRange = {
    from: addDays(new Date(), -60), // 60 days ago
    to: addDays(new Date(), -30),   // 30 days ago
  };

  const [totalLogins, totalUsers, totalDevices, activeNow] = await Promise.all([
    db.activeUserLogs.count({
      where: {
        labId: labId,
        createdAt: {
          gte: previousDateRange.from,
          lte: previousDateRange.to,
        },
      },
    }),
    db.deviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousDateRange.to,
        },
      },
    }),
    db.device.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousDateRange.to,
        },
      },
    }),
    db.activeDeviceUser.count({
      where: {
        labId: labId,
        createdAt: previousDateRange.to,
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
