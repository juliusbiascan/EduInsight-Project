"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentUsers, RecentUsersType } from "./recent-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTabs } from "./analytics-tabs";
import { ReportsContent } from './reports-contents';
import { Heart, Sparkles } from "lucide-react";
import { Overview } from "./overview";
import { DateRange } from "react-day-picker";

interface DashboardTabsProps {
  graphLogin: any;
  recentLogins: RecentUsersType[];
  labId: string;
  dateRange: DateRange;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  graphLogin,
  recentLogins,
  labId,
  dateRange
}) => {
  return (
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
      <TabsContent value="analytics" className="space-y-4">
        <AnalyticsTabs labId={labId} dateRange={dateRange} />
      </TabsContent>
      <TabsContent value="reports" className="space-y-4">
        <ReportsContent labId={labId} dateRange={dateRange} />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">{/* Add notifications content here */}</TabsContent>
    </Tabs>
  );
};

