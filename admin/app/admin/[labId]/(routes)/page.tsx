import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentUsers, RecentUsersType } from "../components/recent-users";
import { Overview } from "../components/overview";
import { StatsCard } from '../components/stats-card';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getTotalDevices } from "@/data/device";
import { getActiveCount } from "@/actions/staff";
import { getAllDeviceUserCount } from "@/data/user";
import { getGraphLogins, getRecentLogins } from "@/data/get-graph-count";
import { TrendingUp, Users, Laptop, Activity, Heart, Sparkles, Rainbow } from "lucide-react";

interface DashboardPageProps { params: { labId: string; }; }

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });
  if (!lab) redirect('/');

  const [allDevices, activeCount, allUser, graphLogin, recentLogin] = await Promise.all([
    getTotalDevices(params.labId), getActiveCount(params.labId), getAllDeviceUserCount(params.labId),
    getGraphLogins(params.labId), getRecentLogins(params.labId)
  ]);

  const formattedRecentLogin: RecentUsersType[] = recentLogin.map(item => ({
    id: item.id, labId: item.labId, userId: item.userId, createdAt: item.createdAt,
  }));

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />
      <StatsOverview totalLogins={recentLogin.length} totalUsers={allUser || 0} totalDevices={allDevices || 0} activeNow={activeCount || 0} />
      <DashboardTabs graphLogin={graphLogin} recentLogins={formattedRecentLogin} />
    </div>
  );
}

const DashboardHeader: React.FC = () => (
  <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">Dashboard</h1>
    </div>
    <div className="flex items-center space-x-2">
      <CalendarDateRangePicker />
      <Button size="sm" className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600">
        <Sparkles className="h-4 w-4 mr-1" /> Report
      </Button>
    </div>
  </div>
);

interface StatsOverviewProps { totalLogins: number; totalUsers: number; totalDevices: number; activeNow: number; }

const StatsOverview: React.FC<StatsOverviewProps> = ({ totalLogins, totalUsers, totalDevices, activeNow }) => (
  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
    <StatsCard title="Total Logins" value={totalLogins} icon={<TrendingUp className="h-4 w-4" />} trend={20.1} />
    <StatsCard title="Total Users" value={totalUsers} icon={<Users className="h-4 w-4" />} trend={180.1} />
    <StatsCard title="Total Devices" value={totalDevices} icon={<Laptop className="h-4 w-4" />} trend={180.1} />
    <StatsCard title="Active Now" value={activeNow} icon={<Activity className="h-4 w-4" />} trend={-5.5} />
  </div>
);

interface DashboardTabsProps { graphLogin: any; recentLogins: RecentUsersType[]; }

const DashboardTabs: React.FC<DashboardTabsProps> = ({ graphLogin, recentLogins }) => (
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
          <CardContent className="p-2"><Overview data={graphLogin} /></CardContent>
        </Card>
        <Card className="overflow-hidden border border-blue-200 dark:border-blue-700 shadow-sm lg:w-1/3">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900">
            <CardTitle className="text-base flex items-center">
              <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" /> Recent Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2"><RecentUsers data={recentLogins} /></CardContent>
        </Card>
      </div>
    </TabsContent>
    <TabsContent value="analytics" className="space-y-4">{/* Add analytics content here */}</TabsContent>
    <TabsContent value="reports" className="space-y-4">{/* Add reports content here */}</TabsContent>
    <TabsContent value="notifications" className="space-y-4">{/* Add notifications content here */}</TabsContent>
  </Tabs>
);

export default DashboardPage;