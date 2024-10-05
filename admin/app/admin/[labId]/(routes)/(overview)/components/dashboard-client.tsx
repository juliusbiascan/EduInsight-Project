"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { RecentUsersType } from "./recent-users";
import { getTotalDevices } from "@/data/device";
import { getActiveCount } from "@/actions/staff";
import { getAllDeviceUserCount } from "@/data/user";
import { getGraphLogins, getRecentLogins } from "@/data/get-graph-count";
import { DateRange } from "react-day-picker";
import { addDays, format } from 'date-fns';
import { getPreviousStats } from "@/data/stats";
import { StatsOverview } from './stats-overview';
import { DashboardTabs } from './dashboard-tabs';
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Rainbow, Sparkles, Download } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

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
      getPreviousStats(params.labId)
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

  const DashboardReport: React.FC<{ data: ReturnType<typeof generateReportData> }> = ({ data }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Dashboard Report</Text>
          <Text style={styles.text}>Date Range: {format(data.dateRange.from!, 'PP')} - {format(data.dateRange.to!, 'PP')}</Text>
          <Text style={styles.text}>Total Logins: {data.totalLogins}</Text>
          <Text style={styles.text}>Total Users: {data.totalUsers}</Text>
          <Text style={styles.text}>Total Devices: {data.totalDevices}</Text>
          <Text style={styles.text}>Active Now: {data.activeNow}</Text>
        </View>
      </Page>
    </Document>
  );

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

      <StatsOverview
        totalLogins={data.recentLogin.length}
        totalUsers={data.allUser}
        totalDevices={data.allDevices}
        activeNow={data.activeCount}
        previousStats={data.previousStats}
      />

      <DashboardTabs
        graphLogin={data.graphLogin}
        recentLogins={formattedRecentLogin}
        labId={params.labId}
        dateRange={dateRange}
      />
    </div>
  );
}
