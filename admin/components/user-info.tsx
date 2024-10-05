import { ExtendedUser } from "@/next-auth";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
};

export const UserInfo = ({
  user,
  label,
}: UserInfoProps) => {
  return (
    <Card className="w-[600px] shadow-md bg-white dark:bg-gray-800 transition-colors duration-200">
      <CardHeader>
        <p className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200">
          {label}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "ID", value: user?.id },
          { label: "Name", value: user?.name },
          { label: "Email", value: user?.email },
          { label: "Role", value: user?.role },
        ].map((item, index) => (
          <div key={index} className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {item.label}
            </p>
            <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md">
              {item.value}
            </p>
          </div>
        ))}

        <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Two Factor Authentication
          </p>
          <Badge
            variant={user?.isTwoFactorEnabled ? "success" : "destructive"}
            className="text-xs font-semibold"
          >
            {user?.isTwoFactorEnabled ? "ON" : "OFF"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}