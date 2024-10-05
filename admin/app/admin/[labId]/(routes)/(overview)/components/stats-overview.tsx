"use client";

import { TrendingUp, Users, Laptop, Activity, Heart, Sparkles } from "lucide-react";
import { StatsCard } from './stats-card';

interface StatsOverviewProps {
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
  previousStats: {
    totalLogins: number;
    totalUsers: number;
    totalDevices: number;
    activeNow: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ totalLogins, totalUsers, totalDevices, activeNow, previousStats }) => {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 100; // If previous was 0, assume 100% increase
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
      <StatsCard
        title="Total Logins"
        value={totalLogins}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={calculateTrend(totalLogins, previousStats.totalLogins)}
      />
      <StatsCard
        title="Total Users"
        value={totalUsers}
        icon={<Users className="h-4 w-4" />}
        trend={calculateTrend(totalUsers, previousStats.totalUsers)}
      />
      <StatsCard
        title="Total Devices"
        value={totalDevices}
        icon={<Laptop className="h-4 w-4" />}
        trend={calculateTrend(totalDevices, previousStats.totalDevices)}
      />
      <StatsCard
        title="Active Now"
        value={activeNow}
        icon={<Activity className="h-4 w-4" />}
        trend={calculateTrend(activeNow, previousStats.activeNow)}
      />
    </div>
  );
};