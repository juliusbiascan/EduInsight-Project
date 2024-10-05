"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRange } from "react-day-picker";
import { getDeviceUsageStats, getUserActivityStats } from "@/data/analytics";

interface AnalyticsTabsProps {
  labId: string;
  dateRange: DateRange;
}

interface DeviceUsageStats {
  name: string;
  usage: number;
}

interface UserActivityStats {
  name: string;
  activity: number;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ labId, dateRange }) => {
  const [deviceUsageStats, setDeviceUsageStats] = useState<DeviceUsageStats[]>([]);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [deviceStats, userStats] = await Promise.all([
        getDeviceUsageStats(labId, dateRange),
        getUserActivityStats(labId, dateRange)
      ]);
      setDeviceUsageStats(deviceStats);
      setUserActivityStats(userStats);
    };

    fetchData();
  }, [labId, dateRange]);

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
          <CardTitle className="text-base flex items-center">
            <Laptop className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Device Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deviceUsageStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border border-blue-200 dark:border-blue-700 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900">
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" /> User Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userActivityStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activity" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};