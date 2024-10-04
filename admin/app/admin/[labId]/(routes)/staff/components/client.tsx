"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { UserColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface StaffClientProps {
  data: UserColumn[]
}

export const StaffClient: React.FC<StaffClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();
  return (
    <div className="space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="w-10 h-10 text-pink-500 dark:text-pink-400" />
          <Heading
            title={`Staff (${data?.length})`}
            description="Manage staff for your laboratory"
            className="text-indigo-700 dark:text-indigo-300"
          />
        </div>
        <Button
          onClick={() => router.push(`/admin/${params.labId}/staff/register`)}
          className="bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-200 rounded-full px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register
        </Button>
      </div>
      <Separator className="bg-indigo-200 dark:bg-indigo-700" />
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
        <DataTable columns={columns} data={data} searchKey="name" title={"Staffs"} />
      </div>
      <div className="mt-12">
        <Heading
          title="API"
          description="API calls for Staff"
          className="text-indigo-700 dark:text-indigo-300 mb-4"
        />
        <Separator className="bg-indigo-200 dark:bg-indigo-700 mb-6" />
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
          <ApiList entityName="users" entityIdName="labId" />
        </div>
      </div>
    </div>
  )
}