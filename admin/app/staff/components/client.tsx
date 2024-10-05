"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getStudentCount, getTeacherCount, getGuestCount, getActiveCount } from "@/actions/staff";
import { getTotalDevices } from "@/data/device";
import { getGraphLogins } from "@/data/get-graph-count";
import { DateRange } from "react-day-picker";
import { addDays } from 'date-fns';
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Rainbow, Download, Activity, Laptop, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Overview } from "@/components/overview";
import { StatsCard } from '@/components/stats-card';
import { RadialChart } from '@/components/radial-chart';

interface DashboardClientProps {
  labId: string;
}

interface GraphData {
  name: string;
  total: number;
}

interface DashboardData {
  allDevices: number;
  activeCount: number;
  studentCount: number;
  teacherCount: number;
  guestCount: number;
  graphLogin: GraphData[];
}

export const StaffDashboardClient: React.FC<DashboardClientProps> = ({ labId }) => {

  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [data, setData] = useState<DashboardData>({
    allDevices: 0,
    activeCount: 0,
    studentCount: 0,
    teacherCount: 0,
    guestCount: 0,
    graphLogin: [],
  });

  const fetchData = useCallback(async (newDateRange: DateRange) => {

    const [allDevices, activeCount, studentCount, teacherCount, guestCount, graphLogin] = await Promise.all([
      getTotalDevices(labId, newDateRange),
      getActiveCount(labId),
      getStudentCount(labId),
      getTeacherCount(labId),
      getGuestCount(labId),
      getGraphLogins(labId),
    ]);

    setData({
      allDevices: allDevices || 0,
      activeCount: activeCount,
      studentCount: studentCount,
      teacherCount: teacherCount,
      guestCount: guestCount,
      graphLogin: graphLogin,
    });
  }, [labId]);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange && newRange.from && newRange.to) {
      setDateRange(newRange);
      fetchData(newRange);
    }
  };

  const deviceData = [
    { name: 'Active', value: data.activeCount, color: '#10B981' },
    { name: 'Inactive', value: data.allDevices - data.activeCount, color: '#6B7280' },
  ];

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button
            size="sm"
            className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600"
          >
            <Download className="h-4 w-4 mr-1" />
            Download Report
          </Button>
        </div>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title="Active Now"
          value={data.activeCount}
          icon={<Activity className="h-4 w-4" />} />
        <StatsCard
          title="Total Students"
          value={data.studentCount}
          icon={<Users className="h-4 w-4" />} />
        <StatsCard
          title="Total Teachers"
          value={data.teacherCount}
          icon={<Users className="h-4 w-4" />} />
        <StatsCard
          title="Total Guests"
          value={data.guestCount}
          icon={<Users className="h-4 w-4" />} />
        <StatsCard
          title="Total Devices"
          value={data.allDevices}
          icon={<Laptop className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
            <CardTitle className="text-base flex items-center">
              <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Login Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2"><Overview data={data.graphLogin} /></CardContent>
        </Card>

        <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
            <CardTitle className="text-base flex items-center">
              <Laptop className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" /> Device Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <RadialChart data={deviceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import React, { useState, useEffect, useCallback } from 'react';
// import { getStudentCount, getTeacherCount, getGuestCount, getActiveCount } from "@/actions/staff";
// import { getTotalDevices } from "@/data/device";
// import { getGraphLogins } from "@/data/get-graph-count";
// import { DateRange } from "react-day-picker";
// import { addDays } from 'date-fns';
// import { CalendarDateRangePicker } from "@/components/date-range-picker";
// import { Button } from "@/components/ui/button";
// import { Rainbow, Download, Activity, Laptop, Users } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Heart } from "lucide-react";
// import { Overview } from "@/components/overview";
// import { StatsCard } from '@/components/stats-card';
// import { auth } from "@/auth";
// import { getUserById } from "@/data/user";
// import { db } from "@/lib/db";
// import { redirect } from "next/navigation";

// interface DashboardClientProps {
//   labId: string;
// }

// interface GraphData {
//   name: string;
//   total: number;
// }

// interface DashboardData {
//   allDevices: number;
//   activeCount: number;
//   studentCount: number;
//   teacherCount: number;
//   guestCount: number;
//   graphLogin: GraphData[];
// }

// export const DashboardClient: React.FC<DashboardClientProps> = ({ labId }) => {
//   const [dateRange, setDateRange] = useState<DateRange>({
//     from: addDays(new Date(), -30),
//     to: new Date(),
//   });

//   const [data, setData] = useState<DashboardData>({
//     allDevices: 0,
//     activeCount: 0,
//     studentCount: 0,
//     teacherCount: 0,
//     guestCount: 0,
//     graphLogin: [],
//   });

//   const fetchData = useCallback(async (newDateRange: DateRange) => {
//     const [allDevices, activeCount, studentCount, teacherCount, guestCount, graphLogin] = await Promise.all([
//       getTotalDevices(labId, newDateRange),
//       getActiveCount(labId),
//       getStudentCount(labId),
//       getTeacherCount(labId),
//       getGuestCount(labId),
//       getGraphLogins(labId),
//     ]);

//     setData({
//       allDevices: allDevices || 0,
//       activeCount: activeCount || 0,
//       studentCount: studentCount || 0,
//       teacherCount: teacherCount || 0,
//       guestCount: guestCount || 0,
//       graphLogin: graphLogin || [],
//     });
//   }, [labId]);

//   useEffect(() => {
//     fetchData(dateRange);
//   }, [dateRange, fetchData]);

//   const handleDateRangeChange = (newRange: DateRange | undefined) => {
//     if (newRange && newRange.from && newRange.to) {
//       setDateRange(newRange);
//       fetchData(newRange);
//     }
//   };

//   return (
//     <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
//       <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
//         <div className="flex items-center">
//           <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
//           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">Dashboard</h1>
//         </div>
//         <div className="flex items-center space-x-2">
//           <CalendarDateRangePicker
//             value={dateRange}
//             onChange={handleDateRangeChange}
//           />
//           <Button
//             size="sm"
//             className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600"
//           >
//             <Download className="h-4 w-4 mr-1" />
//             Download Report
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
//         <StatsCard
//           title="Active Now"
//           value={data.activeCount}
//           icon={<Activity className="h-4 w-4" />} trend={0} />
//         <StatsCard
//           title="Total Students"
//           value={data.studentCount}
//           icon={<Users className="h-4 w-4" />} trend={0} />
//         <StatsCard
//           title="Total Teachers"
//           value={data.teacherCount}
//           icon={<Users className="h-4 w-4" />} trend={0} />
//         <StatsCard
//           title="Total Guests"
//           value={data.guestCount}
//           icon={<Users className="h-4 w-4" />} trend={0} />
//         <StatsCard
//           title="Total Devices"
//           value={data.allDevices}
//           icon={<Laptop className="h-4 w-4" />} trend={0} />
//       </div>

//       <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
//         <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
//           <CardTitle className="text-base flex items-center">
//             <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Login Activity
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-2"><Overview data={data.graphLogin} /></CardContent>
//       </Card>
//     </div>
//   );
// }
