"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useRouteChange from "@/hooks/use-route-change";
import useScreenSize from "@/hooks/use-screen-size";
import { getUserById } from '@/data/user';
import { getLabByUserId } from '@/data/lab';
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from "@/lib/utils";
import { Menu, Rainbow } from "lucide-react";
import { Labaratory } from '@prisma/client';
import Sidebar from "./components/sidebar";
import { BeakerIcon } from '@heroicons/react/24/solid'

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { labId: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isMediumOrSmaller = useScreenSize();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [lab, setLab] = useState<Labaratory | null>(null);

  useRouteChange(() => setIsMobileNavOpen(false));

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const user = await getUserById(session.user.id!);
        if (!user) {
          router.push("/auth/login");
          return;
        }
        const fetchedLab = await getLabByUserId(user.labId!);
        if (!fetchedLab) {
          router.push("/");
          return;
        }
        setLab(fetchedLab);
      }
    };
    fetchData();
  }, [router, session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen items-stretch">
        <ResizablePanel
          defaultSize={18}
          collapsedSize={4}
          collapsible
          minSize={18}
          maxSize={18}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className={cn("hidden lg:block", isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
        >
          <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? "h-[52px]" : "px-2")}>
            <Image src="/smnhs_logo.png" alt="logo" width={38} height={38} />
            {!isCollapsed && <h2 className="ml-2 text-lg font-semibold">EduInsight</h2>}
          </div>
          <Separator />
          <Sidebar isCollapsed={isCollapsed} />
        </ResizablePanel>
        <ResizableHandle className="hidden lg:flex" withHandle />

        <ResizablePanel defaultSize={!isMediumOrSmaller ? 82 : 100}>
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center">
              <Button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                variant="ghost"
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <BeakerIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-300 animate-bounce ml-2 lg:ml-0" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400 ml-2">
                {lab?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
          <Separator />
          <div className="p-4">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent className="px-2 py-3" side="left">
          <SheetHeader>
            <SheetTitle className="text-left">EduInsight</SheetTitle>
          </SheetHeader>
          <Sidebar isMobileSidebar isCollapsed={false} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
