import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getUserByEmail } from "@/data/user";

import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: { labId: string } }
) {
  try {

    const session = await auth();

    const body = await req.json();

    if (!session) {
      return new Response("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    const {
      name,
      email,
      password,
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
    if (!password) {
      return new Response("Password is required", { status: 400 });
    }

    if (!params.labId) {
      return new Response("Lab Id is required", { status: 400 });
    }

    const labByUserId = await db.labaratory.findFirst({
      where: {
        id: params.labId,
        userId: id,
      }
    })

    if (!labByUserId) {
      return new Response("Unauthorized", { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return new Response("Email already in use!", { status: 403 });
    }

    const device = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isTwoFactorEnabled,
        labId: params.labId,
        emailVerified: new Date(),
      }
    })

    return Response.json(device);

  } catch (err) {
    console.log(`[DEVICE_POST] ${err}`);
    return new Response(`Internal error`, { status: 500 })
  }
}
