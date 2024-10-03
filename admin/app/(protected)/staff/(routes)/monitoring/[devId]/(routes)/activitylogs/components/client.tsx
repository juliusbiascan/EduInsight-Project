"use client"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ActivityLogs } from "@prisma/client"
import { FiClock, FiMonitor, FiUser, FiFolder } from "react-icons/fi"

interface ActivityLogsClientProps {
  data: ActivityLogs[]
}

export const ActivityLogsClient: React.FC<ActivityLogsClientProps> = ({
  data
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Activity Logs"
          description="View Activity Logs of this User"
        />
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <FiClock className="w-4 h-4" />
              <span className="text-sm">{item.createdAt.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-800 font-semibold mb-2">
              <FiMonitor className="w-4 h-4" />
              <span>{item.title}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <FiUser className="w-4 h-4" />
              <span className="text-sm">{item.ownerName}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FiFolder className="w-4 h-4" />
              <span className="text-sm truncate">{item.ownerPath}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}