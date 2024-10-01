import { DeviceUser, Subject } from "@prisma/client";
import logo from "@/renderer/assets/smnhs_logo.png";
import { useToast } from "../hooks/use-toast";
import { WindowIdentifier } from "@/shared/constants";
import { LogOut } from "lucide-react";
import { Toaster } from "./ui/toaster";
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface StudentViewProps {
  user: DeviceUser;
  handleLogout: () => void; // Add this prop
}

export const StudentView: React.FC<StudentViewProps> = ({
  user,
  handleLogout,
}) => {
  const { toast } = useToast()
  const [subjectCode, setSubjectCode] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [subjectData, setSubjectData] = useState({
    quizzes: [{ id: 1, name: "Quiz 1" }],
    activities: [{ id: 1, name: "Activity 1" }],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeavingSubject, setIsLeavingSubject] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [user.id]); // Add user.id as a dependency

  const fetchSubjects = async () => {
    try {
      const data = await api.database.getStudentSubjects(user.id);
      setSubjects(data);

      // Automatically select the first subject if available
      if (data.length > 0) {
        handleSubjectChange(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({ title: "Error", description: "Failed to load subjects", variant: "destructive" });
    }
  };

  const handleJoinSubject = async () => {
    if (!subjectCode.trim()) {
      toast({ title: "Error", description: "Please enter a subject code", variant: "destructive" });
      return;
    }
    setIsJoining(true);
    try {
      // First, check if the student has already joined this subject
      const existingSubjects = await api.database.getStudentSubjects(user.id);
      const alreadyJoined = existingSubjects.some(subject => subject.subjectCode === subjectCode);

      if (alreadyJoined) {
        toast({ title: "Info", description: "You have already joined this subject", variant: "default" });
        setSubjectCode('');
        setIsDialogOpen(false);
      } else {
        const result = await api.database.joinSubject(subjectCode, user.id, user.labId);
        if (result.success) {
          toast({ title: "Success", description: "Subject joined successfully" });
          setSubjectCode('');
          fetchSubjects(); // Refresh the subjects list
          setIsDialogOpen(false); // Close the dialog
        } else {
          toast({ title: "Error", description: result.message || "Failed to join subject", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error('Error joining subject:', error);
      toast({ title: "Error", description: "Failed to join subject", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    // Fetch actual data for the selected subject
    fetchSubjectData(value);
  };

  const fetchSubjectData = async (subjectId: string) => {
    try {
      // Replace this with an actual API call to fetch subject data
      // const data = await api.database.getSubjectData(subjectId);
      // setSubjectData(data);
    } catch (error) {
      console.error('Error fetching subject data:', error);
      toast({ title: "Error", description: "Failed to load subject data", variant: "destructive" });
    }
  };

  const handleLeaveSubject = async () => {
    if (!selectedSubject) {
      toast({ title: "Error", description: "Please select a subject to leave", variant: "destructive" });
      return;
    }
    setIsLeavingSubject(true);
    try {
      // Replace this with your actual API call to leave the subject
      const result = await api.database.leaveSubject(selectedSubject, user.id);
      if (result.success) {
        toast({ title: "Success", description: "Subject left successfully" });
        setSelectedSubject('');
        fetchSubjects(); // Refresh the subjects list
      } else {
        toast({ title: "Error", description: result.message || "Failed to leave subject", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error leaving subject:', error);
      toast({ title: "Error", description: "Failed to leave subject", variant: "destructive" });
    } finally {
      setIsLeavingSubject(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="EduInsight Logo" className="h-8 w-auto mr-2" />
          <h1 className="text-lg font-semibold">Student Dashboard</h1>
        </div>
        {/* User Info and Settings */}
        <div className="flex items-center">
          <img src={user.image || '/default-avatar.png'} alt="User Avatar" className="w-6 h-6 rounded-full mr-2" />
          <span className="text-sm mr-4">{user.firstName} {user.lastName}</span>
          <button
            className="text-white hover:text-gray-200 mr-2"
            onClick={() => toast({ title: "Settings", description: "Settings panel opened" })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
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
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade:</p>
                <p className="font-medium">10th</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID:</p>
                <p className="font-medium">{user.schoolId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login:</p>
                <p className="font-medium">May 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Subject Picker */}
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <h2 className="text-md font-semibold">Select Subject</h2>
            {subjects.length > 0 ? (
              <div className="flex-grow mx-4">
                <Select onValueChange={handleSubjectChange} value={selectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-gray-500 flex-grow mx-4">No subjects available. Please join a subject first.</p>
            )}
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>Join New Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Subject</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4">
                    <Input
                      placeholder="Enter subject code"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                    />
                    <Button onClick={handleJoinSubject} disabled={isJoining}>
                      {isJoining ? 'Joining...' : 'Join Subject'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={!selectedSubject}>Leave Subject</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You will need to rejoin the subject if you want to access it again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeaveSubject} disabled={isLeavingSubject}>
                      {isLeavingSubject ? 'Leaving...' : 'Leave Subject'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Progress Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">8</p>
                <p className="text-sm text-gray-600">Quizzes Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm text-gray-600">Activities Finished</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">85%</p>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>
          </div>

          {/* Quizzes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Quizzes</h2>
            {subjects.length > 0 ? (
              selectedSubject ? (
                subjectData.quizzes.length > 0 ? (
                  <ul className="space-y-2">
                    {subjectData.quizzes.map((quiz) => (
                      <li key={quiz.id} className="flex justify-between items-center">
                        <span>{quiz.name}</span>
                        <button
                          className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                          onClick={() => toast({ title: "Quiz Started", description: `You've started ${quiz.name}` })}
                        >
                          Start
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No quizzes available for this subject.</p>
                )
              ) : (
                <p className="text-gray-500">Please select a subject to view quizzes.</p>
              )
            ) : (
              <p className="text-gray-500">Join a subject to view available quizzes.</p>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Activities</h2>
            {subjects.length > 0 ? (
              selectedSubject ? (
                subjectData.activities.length > 0 ? (
                  <ul className="space-y-2">
                    {subjectData.activities.map((activity) => (
                      <li key={activity.id} className="flex justify-between items-center">
                        <span>{activity.name}</span>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          onClick={() => toast({ title: "Activity Started", description: `You've started ${activity.name}` })}
                        >
                          Begin
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No activities available for this subject.</p>
                )
              ) : (
                <p className="text-gray-500">Please select a subject to view activities.</p>
              )
            ) : (
              <p className="text-gray-500">Join a subject to view available activities.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center p-2">
        <p className="text-xs text-gray-500">&copy; 2024 EduInsight. All rights reserved.</p>
      </footer>

      <Toaster />
    </div>
  );
}