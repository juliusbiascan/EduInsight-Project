import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendEmail } from "@/lib/mail" // Import email sending function
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

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return new Response("Email already in use!", { status: 403 });
    }

    // Send email with password
    const emailResponse = await sendEmail({
      to: email,
      subject: "Your new account password",
      html: `<p>Your password is: ${password}</p>`,
    });

    if (!emailResponse) {
      return new Response("Failed to send email", { status: 500 });
    }

    // Create the user in the database
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isTwoFactorEnabled,
        labId: params.labId,
        emailVerified: new Date(),
      }
    })

    // Return success response without password
    return Response.json({ ...user, password: undefined });

  } catch (err) {
    console.log(`[DEVICE_POST] ${err}`);
    return new Response(`Internal error`, { status: 500 })
  }
}
