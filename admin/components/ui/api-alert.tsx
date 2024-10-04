"use client"
import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge, BadgeProps } from "./badge";
import { Button } from "./button";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface ApiAlertProps {
  title: string;
  description: string;
  variant: 'public' | 'admin';
}

const textMap: Record<ApiAlertProps["variant"], string> = {
  public: 'Public',
  admin: 'Admin'
}
const variantMap: Record<ApiAlertProps["variant"], BadgeProps['variant']> = {
  public: 'secondary',
  admin: 'destructive'
}

export const ApiAlert: React.FC<ApiAlertProps> = ({
  title,
  description,
  variant = 'public'
}) => {
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("API Route copied to the clipboard", {
      icon: '🎉',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 border-2 border-pink-300 dark:border-pink-700 rounded-lg shadow-lg">
        <Server className="w-6 h-6 text-purple-500" />
        <AlertTitle className="flex items-center gap-x-2 text-lg font-bold text-purple-700 dark:text-purple-300">
          {title}
          <Badge variant={variantMap[variant]} className="ml-2 animate-pulse">
            {textMap[variant]}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-4">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md p-2">
            <code className="text-sm font-mono font-semibold text-pink-600 dark:text-pink-400">
              {description}
            </code>
            <Button
              variant='outline'
              size="sm"
              onClick={onCopy}
              className="ml-2 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}