import { redirect } from 'next/navigation';
import InOutClient from './components/client';
import { db } from '@/lib/db';
import { auth } from '@/auth';

const InOutPage = async () => {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) {
    return null;
  }

  const labId = user.labId

  if (!labId) {
    redirect("/")
  }

  return (
    <InOutClient labId={labId} />
  );
}

export default InOutPage;