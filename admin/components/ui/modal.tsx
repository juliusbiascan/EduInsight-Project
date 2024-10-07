"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Import useTheme hook for dark mode support
import { useTheme } from "next-themes";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children
}) => {
  // Add useTheme hook
  const { theme } = useTheme();

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className={`
        sm:max-w-[425px] 
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-pink-50 to-blue-50' 
        } 
        rounded-lg shadow-lg 
        transition-all duration-300 ease-in-out
        transform hover:scale-105
      `}>
        <DialogHeader className="space-y-2">
          <DialogTitle className={`
            text-2xl font-bold bg-clip-text text-transparent
            bg-gradient-to-r from-pink-500 to-blue-500
            dark:from-pink-400 dark:to-blue-400
          `}>
            {title}
          </DialogTitle>
          <DialogDescription className={`
            text-sm 
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={`
          mt-4 p-4 rounded-md
          ${theme === 'dark' 
            ? 'bg-gray-800 bg-opacity-50' 
            : 'bg-white bg-opacity-50'
          }
          transition-all duration-300 ease-in-out
        `}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
