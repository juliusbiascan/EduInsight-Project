import logo from "@/renderer/assets/smnhs_logo.png";

import { Button } from "./ui/button";
import { Toaster } from "./ui/toaster";
import { useToast } from "../hooks/use-toast";
import { ActiveDeviceUser, ActiveUserLogs, DeviceUser, Subject, SubjectRecord } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { LogOut, PlusCircle } from "lucide-react";
import { WindowIdentifier } from "@/shared/constants";
import { formatDistance } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Input } from "@/renderer/components/ui/input"
import { Label } from "@/renderer/components/ui/label"
import { Textarea } from "@/renderer/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/renderer/components/ui/alert-dialog"
import { Trash2 } from "lucide-react";
import { generateSubjectCode } from "@/shared/utils";

interface TeacherViewProps {
  user: DeviceUser;
  recentLogin: ActiveUserLogs;
  handleLogout: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  user,
  recentLogin,
  handleLogout,
}) => {

  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectCode, setNewSubjectCode] = useState<string>('');
  const [newSubjectDescription, setNewSubjectDescription] = useState<string>('');
  const [subjectRecords, setSubjectRecords] = useState<SubjectRecord[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveDeviceUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialogRef = useRef<() => void>(() => { });

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        const fetchedSubjects = await api.database.getSubjectsByLabId(user.labId);
        if (fetchedSubjects && fetchedSubjects.length > 0) {
          setSubjects(fetchedSubjects);
          setSelectedSubject(fetchedSubjects[0]);
        } else {
          setSubjects([]);
          setSelectedSubject(null);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast({
          title: "Error",
          description: "Failed to fetch subjects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [user.labId, toast]);

  useEffect(() => {
    if (newSubjectName) {
      const code = generateSubjectCode(newSubjectName);
      setNewSubjectCode(code);
    } else {
      setNewSubjectCode('');
    }
  }, [newSubjectName]);

  const handleCreateSubject = async () => {
    if (newSubjectName) {
      try {
        const newSubject = {
          name: newSubjectName,
          labId: user.labId,
          userId: user.id,
          description: newSubjectDescription,
          subjectCode: newSubjectCode,
        };

        const createdSubject = await api.database.createSubject(newSubject);

        setSubjects(prevSubjects => [...prevSubjects, createdSubject]);
        setSelectedSubject(createdSubject);
        toast({
          title: "Subject Created",
          description: `You've created the ${newSubjectName} subject`,
        });
        setNewSubjectName('');
        setNewSubjectCode('');
        setNewSubjectDescription('');
        setIsDialogOpen(false); // Close the dialog
        closeDialogRef.current(); // Call the close function
      } catch (error) {
        console.error("Error creating subject:", error);
        let errorMessage = "Failed to create subject. Please try again.";
        if (error instanceof Error) {
          if (error.message.includes("Unique constraint failed")) {
            errorMessage = "A subject with this code already exists. Please use a different subject code.";
          } else {
            errorMessage = error.message;
          }
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid Input",
        description: "Please ensure subject name is filled.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      const fetchActiveUsers = async () => {
        const subjectRecords = await api.database.getSubjectRecordsBySubjectId(selectedSubject.id);

        setSubjectRecords(subjectRecords);
        const activeUsers = await api.database.getActiveUsersBySubjectId(selectedSubject.id);
        setActiveUsers(activeUsers);
      };
      fetchActiveUsers();
    }
  }, [selectedSubject]);

  // Add this new function to handle subject change
  const handleSubjectChange = async (value: string) => {
    const newSelectedSubject = subjects.find(s => s.id === value) || null;
    setSelectedSubject(newSelectedSubject);

    const subjectRecords = await api.database.getSubjectRecordsBySubjectId(value);
    setSubjectRecords(subjectRecords);

    const activeUsers = await api.database.getActiveUsersBySubjectId(value);
    setActiveUsers(activeUsers);
  };

  const handleDeleteSubject = async () => {
    if (selectedSubject) {
      try {
        await api.database.deleteSubject(selectedSubject.id);
        setSubjects(prevSubjects => prevSubjects.filter(s => s.id !== selectedSubject.id));
        setSelectedSubject(null);
        toast({
          title: "Subject Deleted",
          description: `You've deleted the ${selectedSubject.name} subject`,
        });
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast({
          title: "Error",
          description: "Failed to delete subject. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="EduInsight Logo" className="h-8 w-auto mr-2" />
          <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
        </div>
        {/* User Info and Settings */}
        <div className="flex items-center">
          <img src={user.image || '/default-avatar.png'} alt="User Avatar" className="w-6 h-6 rounded-full mr-2" />
          <span className="text-sm mr-4">{user.firstName} {user.lastName}</span>
          <button
            className="text-white hover:text-gray-200 mr-2"
            onClick={() => toast({ title: "Settings", description: "Settings panel opened" })}
          >
            {/* ... settings icon SVG ... */}
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
          {/* Teacher Info Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Teacher Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Subject:</p>
                <div className="flex space-x-2">
                  {isLoading ? (
                    <p>Loading subjects...</p>
                  ) : subjects.length > 0 ? (
                    <>
                      <Select
                        value={selectedSubject?.id || undefined}
                        onValueChange={handleSubjectChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id || 'placeholder-id'}>
                              {subject.name} ({subject.subjectCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" disabled={!selectedSubject}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              {selectedSubject?.name} subject and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSubject}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <p>No subjects available</p>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Subject</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new subject you want to create.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="code" className="text-right">
                            Code
                          </Label>
                          <Input
                            id="code"
                            value={newSubjectCode}
                            readOnly
                            className="col-span-3 bg-gray-100"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={newSubjectDescription}
                            onChange={(e) => setNewSubjectDescription(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateSubject}>Create Subject</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">TeacherID:</p>
                <p className="font-medium">{user.schoolId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login:</p>
                <p className="font-medium">{formatDistance(
                  new Date(recentLogin.createdAt),
                  new Date(),
                  { addSuffix: true }
                )}</p>
              </div>
            </div>
          </div>

          {/* Class Overview */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Class Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{activeUsers.length}</p>
                <p className="text-sm text-gray-600">Active Classes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{subjectRecords.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {activeUsers.length > 0
                    ? ((activeUsers.length / subjectRecords.length) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-sm text-gray-600">Average Attendance</p>
              </div>
            </div>
          </div>
          {/* Assignments */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Assignments</h2>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>{selectedSubject?.name || 'No Subject'} Assignment</span>
                <button
                  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                  onClick={() => toast({ title: "Assignment Created", description: `You've created an assignment for ${selectedSubject?.name || 'No Subject'}` })}
                  disabled={!selectedSubject}
                >
                  Create
                </button>
              </li>
              <li className="flex justify-between items-center">
                <span>Grade Assignments</span>
                <button
                  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                  onClick={() => toast({ title: "Grading Started", description: "You've started grading assignments" })}
                >
                  Start
                </button>
              </li>
            </ul>
          </div>
          {/* Student Progress */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold mb-3">Student Progress</h2>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>{selectedSubject?.name || 'No Subject'} Progress Report</span>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  onClick={() => toast({ title: "Report Generated", description: `Progress report for ${selectedSubject?.name || 'No Subject'} has been generated` })}
                  disabled={!selectedSubject}
                >
                  Generate
                </button>
              </li>
              <li className="flex justify-between items-center">
                <span>Individual Student Assessment</span>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  onClick={() => toast({ title: "Assessment Tool Opened", description: "Individual student assessment tool is now open" })}
                >
                  Open
                </button>
              </li>
            </ul>
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