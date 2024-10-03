import logo from "@/renderer/assets/smnhs_logo.png";

import { WindowIdentifier } from "@/shared/constants";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/renderer/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card"
import { Toaster } from "@/renderer/components/ui/toaster"
import { useToast } from "../hooks/use-toast";

interface GuestViewProps {
  handleLogout: () => void;
}
export const GuestView: React.FC<GuestViewProps> = ({ handleLogout }) => {

  const { toast } = useToast()

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="EduInsight Logo" className="h-8 w-auto mr-2" />
          <h1 className="text-lg font-semibold">Guest Dashboard</h1>
        </div>
        {/* User Info and Settings */}
        <div className="flex items-center">
          <UserRound className="w-6 h-6 rounded-full mr-2" />
          <span className="text-sm mr-4">Guest User</span>
          <button
            className="text-white hover:text-gray-200 mr-2"
            onClick={() => window.location.reload()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            className="text-white hover:text-gray-200 mr-2"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-white hover:text-gray-200"
            onClick={() => api.window.hide(WindowIdentifier.Dashboard)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Welcome Card */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Welcome, Guest!</CardTitle>
              <CardDescription>You're currently logged in as a guest user.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">As a guest, you have limited access to features. To unlock full functionality, please contact an administrator or log in with a registered account.</p>
              <Button onClick={() => toast({ title: "Login Required", description: "Please log in to access full features" })}>
                Log In
              </Button>
            </CardContent>
          </Card>

          {/* Available Features */}
          <Card>
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>View sample lessons</li>
                <li>Access public resources</li>
                <li>Try demo quizzes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Get Started */}
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Explore our platform with these quick actions:</p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => toast({ title: "Sample Lesson", description: "Opening a sample lesson" })}>
                  View Sample Lesson
                </Button>
                <Button className="w-full" onClick={() => toast({ title: "Demo Quiz", description: "Starting a demo quiz" })}>
                  Try Demo Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center p-2">
        <p className="text-xs text-gray-500">&copy; 2024 EduInsight. All rights reserved.</p>
      </footer>

      <Toaster />
    </div>
  );
};
