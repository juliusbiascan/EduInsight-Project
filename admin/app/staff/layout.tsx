"use client"

import Image from 'next/image';
import useRouteChange from "@/hooks/use-route-change";
import useScreenSize from "@/hooks/use-screen-size";
import Sidebar from "./components/sidebar";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from '@/components/theme-toggle';
import { Labaratory } from '@prisma/client';
import { auth } from '@/auth';
import { useRouter } from 'next/navigation';
import { getUserById } from '@/data/user';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { getLabByUserId } from '@/data/lab';


export default function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { labId: string }
}) {
  const { data: session } = useSession();

  const route = useRouter();
  const isMediumOrSmaller = useScreenSize();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [getLab, setLab] = useState<Labaratory>();

  useRouteChange(() => {
    setIsMobileNavOpen(false)
  })

  useEffect(() => {
    const fetchData = async () => {
      if (session) {

        const user = await getUserById(session.user.id!);

        if (!user) {
          route.push("/auth/login")
          return
        }

        const lab = await getLabByUserId(user.labId!)

        if (!lab) {
          route.push("/");
          return;
        }

        setLab(lab);
      }

    }

    fetchData();

  }, [route, session]);

  return (
    <main>
      <ResizablePanelGroup direction="horizontal" className="min-h-screen items-stretch">
        <ResizablePanel
          defaultSize={18}
          collapsedSize={4}
          collapsible
          minSize={18}
          maxSize={18}
          onCollapse={() => {
            setIsCollapsed(true)
          }}
          onExpand={() => {
            setIsCollapsed(false)
          }}
          className={cn("hidden lg:block", isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
        >
          <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? "h-[52px]" : "px-2")}>
            {/* <AccountSwitcher isCollapsed={isCollapsed} /> */}
            {getLab && <Image src={"/smnhs_logo.png"} alt={'logo'} width={38} height={38} />}
            {getLab && <h2 className='ml-2'>{getLab.name}</h2>}
          </div>
          <Separator />
          <Sidebar isCollapsed={isCollapsed} />
        </ResizablePanel>
        <ResizableHandle className="hidden lg:flex" withHandle />

        <ResizablePanel defaultSize={!isMediumOrSmaller ? 82 : 100}>
          <div className="flex items-center justify-between px-4 py-2 lg:justify-end">
            <Button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              variant="default"
              className="size-9 p-1 md:flex lg:hidden"
            >
              <Menu className="size-6" />
            </Button>

            <div className="flex gap-2">
              <div className="flex w-full items-center md:block lg:hidden">
                {/* <AccountSwitcher isCollapsed /> */}
                <h1> {getLab?.name}</h1>
              </div>
              <div className='flex items-center ml-auto space-x-4'>
                <ThemeToggle />
                <UserButton />
              </div>
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
    </main>
  );
}
