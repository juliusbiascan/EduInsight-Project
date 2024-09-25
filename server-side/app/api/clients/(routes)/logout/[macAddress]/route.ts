import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { macAddress: string } }
) {
  try {

    const macAddress = params.macAddress;

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


    await db.activeDeviceUser.deleteMany({
      where: {
        userId: activeUsers[0].userId,
        deviceId: activeUsers[0].deviceId
      }
    });

    await db.device.updateMany({
      where: {
        id: activeUsers[0].deviceId,
      },
      data: {
        isUsed: false
      }
    });

    return new NextResponse("User logout successfully", { status: 200 });

  } catch (error) {
    console.log('[LOGOUT_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
