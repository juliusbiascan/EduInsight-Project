"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus, Laptop, Zap } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { DeviceColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface DeviceClientProps {
  data: DeviceColumn[]
}

export const DeviceClient: React.FC<DeviceClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Laptop className="w-8 h-8 text-purple-500" />
              <Heading
                title={`Devices (${data?.length})`}
                description="Manage devices for your laboratory"
                className="text-purple-700 dark:text-purple-300 text-sm"
              />
            </div>
            <Button
              onClick={() => router.push(`/admin/${params.labId}/devices/register`)}
              className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-1 h-8"
            >
              <Plus className="w-3 h-3 mr-1" />
              Register Device
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={data} searchKey="name" title="Devices" />

      <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-6 h-6 text-blue-500" />
            <Heading
              title="API"
              description="API calls for Devices"
              className="text-blue-700 dark:text-blue-300 text-sm"
            />
          </div>
          <ApiList entityName="devices" entityIdName="deviceId" />
        </CardContent>
      </Card>
    </motion.div>
  )
}