import { auth } from '@/auth';
import { getUserById } from '@/data/user';
import { db } from '@/lib/db'
import { redirect } from 'next/navigation';
import { PowerLogClient } from './components/client';

const PowerLogsPage = async () => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/auth/login")
  }

  const lab = await db.labaratory.findUnique({
    where: {
      id: user.labId!,
    }
  });

  if (!lab) {
    redirect("/")
  }

  const pml = await db.powerMonitoringLogs.findMany({
    where: {
      labId: lab.id,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <PowerLogClient data={pml} />
      </div>
    </div>
  )
}

export default PowerLogsPage;