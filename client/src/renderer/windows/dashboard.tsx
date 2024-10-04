import '../styles/globals.css';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ActiveUserLogs, Device, DeviceUser, DeviceUserRole, Subject } from '@prisma/client';
import { Toaster } from "@/renderer/components/ui/toaster"
import { useToast } from "@/renderer/hooks/use-toast"
import { Button } from "@/renderer/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/renderer/components/ui/card"

import { TeacherView } from '../components/teacher-view';
import { GuestView } from '../components/guest-view';
import { StudentView } from '../components/student-view';

/**
 * The Index component (Educational Dashboard)
 *
 * @component
 */
function Index() {
  const [user, setUser] = useState<DeviceUser & { subjects: Subject[] } | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [recentLogin, setRecentLogin] = useState<ActiveUserLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast()


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const devices = await api.database.getDevice();
        if (devices && devices.length > 0) {
          setDevice(devices[0]);
          const activeUsers = await api.database.getActiveUserByDeviceId(devices[0].id, devices[0].labId);
          if (activeUsers && activeUsers.length > 0) {
            const users = await api.database.getDeviceUserByActiveUserId(activeUsers[0].userId);
            if (users && users.length > 0) {
              setUser(users[0]);
              const recentLogin = await api.database.getUserRecentLoginByUserId(users[0].id);
              if (recentLogin && recentLogin.length > 0) {
                setRecentLogin(recentLogin[1]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleLogout = () => {
    // Implement logout logic here
    api.database.userLogout(user.id, device.id);

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    // Reset user state or redirect to login page
    setUser(null);
    setDevice(null);
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-indigo-600">Loading...</p>
        <Toaster />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>No User Data Available</CardTitle>
            <CardDescription>We couldn't find any user data. Please try the following:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Check your internet connection</li>
              <li>Ensure you're logged in correctly</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
        <Toaster />
      </div>
    );
  }

  if (user.role === DeviceUserRole.STUDENT) {
    return <StudentView user={user} handleLogout={handleLogout} />
  }

  if (user.role === DeviceUserRole.TEACHER) {
    return <TeacherView user={user} recentLogin={recentLogin} handleLogout={handleLogout} />
  }

  return <GuestView handleLogout={handleLogout} />

}

/**
 * React bootstrapping logic.
 *
 * @function
 * @name anonymous
 */
(() => {
  // grab the root container
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Failed to find the root element.');
  }

  // render the react application
  ReactDOM.createRoot(container).render(<Index />);
})();