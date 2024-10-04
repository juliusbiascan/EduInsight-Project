import logo from "@/renderer/assets/smnhs_logo.png";

import { Button } from "./ui/button";
import { Toaster } from "./ui/toaster";
import { useToast } from "../hooks/use-toast";
import { ActiveDeviceUser, ActiveUserLogs, DeviceUser, Subject, SubjectRecord } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { LogOut, PlusCircle, Book, ChevronDown, RefreshCw } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar"
import { Rainbow, Sun, Cloud, Stars } from "lucide-react";

interface TeacherViewProps {
  user: DeviceUser & { subjects: Subject[] };
  recentLogin: ActiveUserLogs | null;
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
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isCreateSubjectDialogOpen, setIsCreateSubjectDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSubjects = () => {
      setIsLoading(true);
      try {
        const fetchedSubjects = user.subjects;
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
        setIsCreateSubjectDialogOpen(false);
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

  const handleCreateAssignment = (type: 'quiz' | 'activity') => {
    setIsAssignmentDialogOpen(false);
    if (selectedSubject) {
      if (type === 'quiz') {
        api.window.openInTray(WindowIdentifier.QuizTeacher);
        api.window.send(WindowIdentifier.QuizTeacher, {
          subjectId: selectedSubject.id,
        });
      } else {
        toast({
          title: "Coming Soon",
          description: "Activity creation will be available in a future update.",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please select a subject before creating an assignment.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
    toast({ title: "Refreshed", description: "Page content has been updated." });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-3 flex justify-between items-center rounded-b-lg shadow-md">
        <div className="flex items-center">
          <img src={logo} alt="EduInsight Logo" className="h-10 w-auto mr-2 rounded-full border-2 border-white" />
          <h1 className="text-2xl font-bold font-comic-sans">Teacher's Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center cursor-pointer hover:bg-blue-500 rounded-full p-2 transition-colors duration-200">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.image || '/default-avatar.png'} alt="User Avatar" />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm ml-2 mr-1">{user.firstName} {user.lastName}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Teacher Information</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">TeacherID:</p>
                  <p className="font-medium">{user.schoolId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Login:</p>
                  <p className="font-medium">
                    {recentLogin
                      ? formatDistance(new Date(recentLogin.createdAt), new Date(), { addSuffix: true })
                      : "No recent login"}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6 overflow-y-auto">
        {/* Subject Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-yellow-300">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 flex items-center">
            <Rainbow className="mr-3 h-8 w-8" /> Your Subjects
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : subjects.length > 0 ? (
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-2">
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-green-100 hover:bg-green-200 text-green-600">
                      <PlusCircle className="h-5 w-5" />
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
              {selectedSubject && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">{selectedSubject.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Subject Code: {selectedSubject.subjectCode}</p>
                  <p className="text-sm text-gray-600">{selectedSubject.description || 'No description available.'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 mb-4">No subjects available</p>
              <Button onClick={() => setIsCreateSubjectDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                Create Your First Subject
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Overview */}
          <Card className="bg-gradient-to-br from-blue-100 to-green-100 border-4 border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center">
                <Sun className="mr-2 h-6 w-6 text-yellow-400" /> Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-100 rounded-lg p-2">
                  <p className="text-xl font-bold text-blue-600">{activeUsers.length}</p>
                  <p className="text-xs text-gray-600">Active Students</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <p className="text-xl font-bold text-green-600">{subjectRecords.length}</p>
                  <p className="text-xs text-gray-600">Total Enrolled</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <p className="text-xl font-bold text-yellow-600">
                    {activeUsers.length > 0
                      ? ((activeUsers.length / subjectRecords.length) * 100).toFixed(1)
                      : '0'}%
                  </p>
                  <p className="text-xs text-gray-600">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Materials */}
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-300">
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center">
                <Cloud className="mr-2 h-6 w-6 text-blue-400" /> Learning Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">Create New Quiz</span>
                  <Button
                    size="sm"
                    onClick={() => handleCreateAssignment('quiz')}
                    disabled={!selectedSubject}
                  >
                    Create
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Upload Lesson Plan</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Coming Soon", description: "Lesson plan upload will be available in a future update." })}
                  >
                    Upload
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Manage Resources</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Coming Soon", description: "Resource management will be available in a future update." })}
                  >
                    Manage
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Student Progress */}
          <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-4 border-pink-300">
            <CardHeader>
              <CardTitle className="text-purple-600 flex items-center">
                <Stars className="mr-2 h-6 w-6 text-yellow-400" /> Student Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">Generate Progress Report</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Report Generated", description: `Progress report for ${selectedSubject?.name || 'No Subject'} has been generated` })}
                    disabled={!selectedSubject}
                  >
                    Generate
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">View Class Analytics</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Coming Soon", description: "Class analytics will be available in a future update." })}
                  >
                    View
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Individual Assessments</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Coming Soon", description: "Individual assessments will be available in a future update." })}
                  >
                    View
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-300 to-purple-300 text-center p-2">
        <p className="text-sm text-white">&copy; 2024 EduInsight. Spreading joy and knowledge!</p>
      </footer>

      <Toaster />

      {/* Add this new Dialog component for creating a subject */}
      <Dialog open={isCreateSubjectDialogOpen} onOpenChange={setIsCreateSubjectDialogOpen}>
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
  );
}