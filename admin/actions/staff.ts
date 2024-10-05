"use server"

import { db } from "@/lib/db";
import { DeviceUserRole, State } from "@prisma/client";
import { DateRange } from "react-day-picker";

export const getStudentCount = async (labId: string) => {
  const studentCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.STUDENT
    }
  });

  return studentCount;
}

export const getActiveCount = async (labId: string, dateRange?: DateRange) => {
  const studentCount = await db.activeDeviceUser.count({
    where: {
      labId,
      state: State.ACTIVE,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    }
  });

  return studentCount;
}

export const getTeacherCount = async (labId: string) => {
  const studentCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.TEACHER
    }
  });

  return studentCount;
}
export const getGuestCount = async (labId: string) => {
  const studentCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.GUEST
    }
  });

  return studentCount;
}

export const getUserState = async (userId: string) => {
  const activeDeviceUser = await db.activeDeviceUser.count({
    where: {
      userId,
    }
  });

  return activeDeviceUser;
}

