"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getTotalDevices } from "@/data/device";
import { getActiveCount } from "@/actions/staff";
import { getAllDeviceUserCount } from "@/data/user";
import { getGraphLogins, getRecentLogins } from "@/data/get-graph-count";
import { DateRange } from "react-day-picker";
import { addDays, format } from 'date-fns';
import { getPreviousStats } from "@/data/stats";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Rainbow, Download, Activity, Laptop, TrendingUp, Users } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentUsers, RecentUsersType } from "./recent-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTabs } from "./analytics-tabs";
import { ReportsContent } from './reports-contents';
import { Heart, Sparkles } from "lucide-react";
import { Overview } from "./overview";
import { StatsCard } from './stats-card';
import { DashboardReport } from './dashboard-report';

interface DashboardPageProps { params: { labId: string; }; }

interface GraphData {
  name: string;
  total: number;
}

interface RecentLoginData {
  id: string;
  labId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface DashboardData {
  allDevices: number;
  activeCount: number;
  allUser: number;
  graphLogin: GraphData[];
  recentLogin: RecentLoginData[];
  previousStats: {
    totalLogins: number;
    totalUsers: number;
    totalDevices: number;
    activeNow: number;
  };
}

export const DashboardClient: React.FC<DashboardPageProps> = ({ params }) => {

  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [data, setData] = useState<DashboardData>({
    allDevices: 0,
    activeCount: 0,
    allUser: 0,
    graphLogin: [],
    recentLogin: [],
    previousStats: {
      totalLogins: 0,
      totalUsers: 0,
      totalDevices: 0,
      activeNow: 0,
    },
  });

  const fetchData = useCallback(async (newDateRange: DateRange) => {
    const [allDevices, activeCount, allUser, graphLogin, recentLogin, previousStats] = await Promise.all([
      getTotalDevices(params.labId, newDateRange),
      getActiveCount(params.labId, newDateRange),
      getAllDeviceUserCount(params.labId, newDateRange),
      getGraphLogins(params.labId, newDateRange),
      getRecentLogins(params.labId, newDateRange),
      getPreviousStats(params.labId, newDateRange)
    ]);

    setData({
      allDevices: allDevices || 0,
      activeCount: activeCount || 0,
      allUser: allUser || 0,
      graphLogin: graphLogin || [],
      recentLogin: recentLogin || [],
      previousStats: previousStats || {
        totalLogins: 0,
        totalUsers: 0,
        totalDevices: 0,
        activeNow: 0,
      },
    });
  }, [params.labId]);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, params.labId, fetchData]);


  const formattedRecentLogin: RecentUsersType[] = data.recentLogin.map((item) => ({
    id: item.id, labId: item.labId, userId: item.userId, createdAt: item.createdAt,
  }));


  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange && newRange.from && newRange.to) {
      setDateRange(newRange);
      fetchData(newRange);
    }
  };

  const generateReportData = useCallback(() => {
    return {
      totalLogins: data.recentLogin.length,
      totalUsers: data.allUser,
      totalDevices: data.allDevices,
      activeNow: data.activeCount,
      dateRange,
    };
  }, [data.recentLogin.length, data.allUser, data.allDevices, data.activeCount, dateRange]);


  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0; // If previous was 0, return 100% if current is positive, 0% otherwise
    const trend = ((current - previous) / previous) * 100;
    return Number(trend.toFixed(2)); // Round to 2 decimal places
  };
  
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
          <PDFDownloadLink
            document={<DashboardReport data={generateReportData()} />}
            fileName={`dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
          >
            <Button
              size="sm"
              className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600"

            >
              <Download className="h-4 w-4 mr-1" />
              Download Report
            </Button>
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <StatsCard
          title="Total Logins"
          value={data.recentLogin.length}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={calculateTrend(data.recentLogin.length, data.previousStats.totalLogins)}
        />
        <StatsCard
          title="Total Users"
          value={data.allUser}
          icon={<Users className="h-4 w-4" />}
          trend={calculateTrend(data.allUser, data.previousStats.totalUsers)}
        />
        <StatsCard
          title="Total Devices"
          value={data.allDevices}
          icon={<Laptop className="h-4 w-4" />}
          trend={calculateTrend(data.allDevices, data.previousStats.totalDevices)}
        />
        <StatsCard
          title="Active Now"
          value={data.activeCount}
          icon={<Activity className="h-4 w-4" />}
          trend={calculateTrend(data.activeCount, data.previousStats.activeNow)}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="justify-start bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
          <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full">Reports</TabsTrigger>
          <TabsTrigger value="notifications" disabled className="rounded-full">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm lg:flex-grow">
              <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
                <CardTitle className="text-base flex items-center">
                  <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Login Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2"><Overview data={data.graphLogin} /></CardContent>
            </Card>
            <Card className="overflow-hidden border border-blue-200 dark:border-blue-700 shadow-sm lg:w-1/3">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900">
                <CardTitle className="text-base flex items-center">
                  <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" /> Recent Logins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2"><RecentUsers data={formattedRecentLogin} /></CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTabs labId={params.labId} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsContent labId={params.labId} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">{/* Add notifications content here */}</TabsContent>
      </Tabs>
    </div>
  );
}
