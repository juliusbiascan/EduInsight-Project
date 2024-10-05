import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface ReportsContentProps {
  labId: string;
  dateRange: DateRange;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({ labId, dateRange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add your reports content here */}
        <p>Lab ID: {labId}</p>
        <p>Date Range: {dateRange.from?.toDateString()} - {dateRange.to?.toDateString()}</p>
      </CardContent>
    </Card>
  );
};