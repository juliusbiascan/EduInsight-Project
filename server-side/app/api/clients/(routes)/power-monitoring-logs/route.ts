import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { macAddress, pm_status, pm_log_ts } = body;

    if (!macAddress) {
      return new NextResponse("Device Identification is required.", { status: 400 });
    }

    const device = await db.device.findMany({
      where: {
        devMACaddress: macAddress,
      }
    });

    if (!device) {
      return new NextResponse("No device found.", { status: 404 });
    }


    const activeUsers = await db.activeDeviceUser.findMany({
      where: {
        deviceId: device[0].id,
      }
    });

    if (!activeUsers) {
      return new NextResponse("This user is inactive.", { status: 401 });
    }

    const { deviceId, userId, labId } = activeUsers[0];

    const powerMonitoringLogs = await db.powerMonitoringLogs.create({
      data: {
        pm_status: pm_status,
        pm_log_ts: pm_log_ts,
        userId,
        deviceId,
        labId
      }
    })

    return NextResponse.json(powerMonitoringLogs);

  } catch (error) {
    console.log('[POWERMONITORINGLOGS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}