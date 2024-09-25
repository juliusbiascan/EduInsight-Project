import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { macAddress } = body;

    if (!macAddress) {
      return new NextResponse("Device Identification is required.", { status: 400 });
    }

    const device = await db.device.findMany({
      where: {
        devMACaddress: macAddress,
      }
    });

    if (device.length == 0) {
      return new NextResponse("No device found.", { status: 404 });
    }

    const activeUsers = await db.activeDeviceUser.findMany({
      where: {
        deviceId: device[0].id,
      }
    });

    if (activeUsers.length == 0) {
      return new NextResponse("No active user.", { status: 401 });
    }

    const user = await db.deviceUser.findUnique({
      where: {
        id: activeUsers[0].userId,
      }
    });

    return NextResponse.json({ devId: device[0].id, ...user });

  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {

    const macAddress = req.nextUrl.searchParams.get("macAddress");

    if (!macAddress) {
      return new NextResponse("Device Identification is required.", { status: 400 });
    }

    const device = await db.device.findFirst({
      where: {

        devMACaddress: macAddress,
      }
    });

    if (!device) {
      return new NextResponse("This device is not registered.", { status: 404 });
    }

    return NextResponse.json({ devId: device.id });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
