// @/data/analytics.ts
import { DateRange } from "react-day-picker";

export async function getDeviceUsageStats(labId: string, dateRange: DateRange) {
  // Fetch and process data here
  return [
    { name: 'Device A', usage: 400 },
    { name: 'Device B', usage: 300 },
    // ... more data
  ];
}

export async function getUserActivityStats(labId: string, dateRange: DateRange) {
  // Fetch and process data here
  return [
    { name: 'User 1', activity: 200 },
    { name: 'User 2', activity: 150 },
    // ... more data
  ];
}