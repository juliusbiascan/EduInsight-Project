import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {

    if (!params.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: {
        id: params.userId,
      },
    })

    return NextResponse.json(user);
  } catch (err) {
    console.log('[USER_GET]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { labId: string, userId: string } }
) {
  try {

    const session = await auth();

    const body = await req.json();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    const {
      name,
      email,
      isTwoFactorEnabled
    } = body;

    if (!id) {
      return new Response("Unauthenticated", { status: 401 });
    }
    if (!name) {
      return new Response("Name is required", { status: 400 });
    }
    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    if (!params.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const labByUserId = await db.labaratory.findFirst({
      where: {
        id: params.labId,
        userId: id,
      }
    })

    if (!labByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const device = await db.user.update({
      where: {
        id: params.userId
      },
      data: {
        name,
        email,
        isTwoFactorEnabled,
        labId: params.labId,
        emailVerified: new Date(),
      }
    })

    return NextResponse.json(device);

  } catch (err) {
    console.log('[DEVICE_PATCH]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

//// Delete Method

export async function DELETE(
  req: Request,
  { params }: { params: { labId: string, userId: string } }
) {
  try {

    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    if (!id) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.userId) {
      return new NextResponse("Device id is required", { status: 400 });
    }

    const labByUserId = await db.labaratory.findFirst({
      where: {
        id: params.labId,
        userId: id
      }
    })

    if (!labByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const user = await db.user.deleteMany({
      where: {
        id: params.userId,
      }
    })

    return NextResponse.json(user);
  } catch (err) {
    console.log('[USER_DELETE]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}