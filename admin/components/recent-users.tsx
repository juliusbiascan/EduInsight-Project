"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getDeviceUserById } from "@/data/user"
import { DeviceUser } from "@prisma/client"
import { formatDistance } from "date-fns"
import { useEffect, useState, useTransition } from "react"
import { Heart, Star, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type RecentUsersType = {
  id: string
  labId: string
  userId: string
  createdAt: Date
}

// Constant for number of users to display
export const USERS_TO_DISPLAY = 4;

interface RecentUsersProps {
  data: RecentUsersType[]
}

export const RecentUsers: React.FC<RecentUsersProps> = ({
  data
}) => {

  const [users, setUsers] = useState<DeviceUser[]>([])
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  useEffect(() => {

    const fetchData = async () => {
      let userArray: DeviceUser[] = [];
      for (const recent of data) {
        const user = await getDeviceUserById(recent.userId)

        if (user) {
          user.createdAt = recent.createdAt
          userArray.push(user)
        }
      }
      setUsers([...userArray])
    }
    startTransition(() => {
      fetchData();
    })

  }, [data]);

  const getRandomIcon = () => {
    const icons = [Heart, Star, Sparkles];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  const getRandomColor = () => {
    const colors = ['text-pink-500', 'text-purple-500', 'text-blue-500', 'text-green-500', 'text-yellow-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4">
      {currentUsers.map((user) => {
        const Icon = getRandomIcon();
        const iconColor = getRandomColor();
        return (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-pink-300 dark:ring-pink-700">
                <AvatarImage src={user.image} alt="Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  {user.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-grow">
                <p className="text-lg font-semibold leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Icon className={`h-4 w-4 mr-1 ${iconColor}`} />
                  {user.role}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  {formatDistance(
                    new Date(user.createdAt),
                    new Date(),
                    { addSuffix: true }
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}