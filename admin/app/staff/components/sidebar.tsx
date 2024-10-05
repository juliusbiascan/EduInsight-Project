import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import initials from "initials"
import { Circle, ChevronDown } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import useVariantBasedOnRoute from "@/hooks/use-variant-based-on-route"
import { cn } from "@/lib/utils"
import { sidebarItems, SidebarItem, NavItem } from "@/navigation/sidebar-items/sidebarItems"

type GetVariantFunction = (route: string) => "default" | "ghost"

function SidebarHeading({
  heading,
  isMobileSidebar = false,
  isCollapsed,
}: {
  readonly heading: string
  readonly isMobileSidebar: boolean
  readonly isCollapsed: boolean
}) {
  return isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-r from-pink-200 to-indigo-200 dark:from-pink-800 dark:to-indigo-800">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{initials(heading)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700 shadow-lg">
        {heading}
      </TooltipContent>
    </Tooltip>
  ) : (
    <h4 className={cn("px-3 text-gray-500 dark:text-gray-400 text-xs font-semibold mt-4 mb-2 uppercase", isMobileSidebar && "px-1")}>
      {heading}
    </h4>
  )
}

function SidebarItemWithChildren({
  item,
  isCollapsed = false,
  getVariant,
}: {
  readonly item: NavItem
  readonly isCollapsed?: boolean
  readonly getVariant: GetVariantFunction
}) {
  const childRoutes = item.children?.map((child) => child.route || "") ?? []
  const currentPath = usePathname()
  const isActive = childRoutes.some((route) => currentPath.includes(route))

  return (
    <AccordionItem value={item.title} className="border-none">
      <AccordionTrigger
        className={cn(
          "flex items-center justify-between py-2 px-3 rounded-md transition-all duration-200 ease-in-out",
          isCollapsed && "w-9 h-9",
          isActive ? "bg-gradient-to-r from-pink-100 to-indigo-100 dark:from-pink-900 dark:to-indigo-900 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex size-9 items-center justify-center">
                <item.icon className="size-5 text-gray-600 dark:text-gray-300" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700 shadow-lg">
              {item.title}
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <div className="flex items-center">
              <item.icon className="mr-3 size-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <ChevronDown className="size-4 text-gray-500 transition-transform duration-200" />
          </>
        )}
      </AccordionTrigger>
      <AccordionContent className="mt-1 space-y-1 pb-2">
        {item.children?.map((child) =>
          isCollapsed ? (
            <Tooltip key={child.title} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={child.route || "#"}
                  className={cn("flex items-center justify-center h-9 w-9 rounded-md transition-colors duration-200",
                    getVariant(child.route) === "default" ? "bg-pink-100 dark:bg-pink-900 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="text-xs font-medium">{initials(child.title)}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700 shadow-lg">
                {child.title}
                {child.label && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{child.label}</span>}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={child.title}
              href={child.route || "#"}
              className={cn(
                "flex items-center py-2 px-8 rounded-md text-sm transition-colors duration-200",
                getVariant(child.route) === "default" ? "bg-pink-100 dark:bg-pink-900 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Circle className={cn("mr-2 h-2 w-2 text-gray-500 dark:text-gray-400")} />
              <span>{child.title}</span>
              {child.label && <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{child.label}</span>}
            </Link>
          ),
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function CollapsedSidebar({ item, getVariant }: { readonly item: NavItem; readonly getVariant: GetVariantFunction }) {
  if (item.children) {
    return <SidebarItemWithChildren item={item} isCollapsed getVariant={getVariant} />
  }

  const variant = getVariant(item.route ?? "")
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link href={item.route ?? "#"} className={cn("flex items-center justify-center h-9 w-9 rounded-md transition-colors duration-200",
          variant === "default" ? "bg-pink-100 dark:bg-pink-900 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}>
          <item.icon className="size-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700 shadow-lg">
        {item.title}
        {item.label && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{item.label}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

function ExpandedSidebar({ item, getVariant }: { readonly item: NavItem; readonly getVariant: GetVariantFunction }) {
  if (item.children) {
    return <SidebarItemWithChildren item={item} getVariant={getVariant} />
  }

  const variant = getVariant(item.route ?? "")
  return (
    <Link
      href={item.route ?? "#"}
      className={cn("flex items-center py-2 px-3 rounded-md transition-colors duration-200",
        variant === "default" ? "bg-pink-100 dark:bg-pink-900 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <item.icon className="mr-3 size-5 text-gray-600 dark:text-gray-300" />
      <span className="text-sm font-medium">{item.title}</span>
      {item.label && <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{item.label}</span>}
    </Link>
  )
}

interface NavProps {
  readonly isCollapsed: boolean
  readonly isMobileSidebar?: boolean
}

function isNavItem(item: SidebarItem): item is NavItem {
  return (item as NavItem).title !== undefined
}

export default function Sidebar({ isCollapsed, isMobileSidebar = false }: NavProps) {
  const getVariant = useVariantBasedOnRoute()
  return (
    <TooltipProvider delayDuration={0}>
      <Accordion type="single" collapsible className="w-full">
        <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
          <nav
            className={cn(
              "grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2",
              isMobileSidebar && "p-0",
            )}
          >
            {sidebarItems.map((item: SidebarItem) => {
              if (isNavItem(item)) {
                if (isCollapsed) {
                  return <CollapsedSidebar key={item.title} item={item} getVariant={getVariant} />
                }
                return <ExpandedSidebar key={item.title} item={item} getVariant={getVariant} />
              }
              return (
                <SidebarHeading
                  isMobileSidebar={isMobileSidebar}
                  key={item.heading}
                  heading={item.heading}
                  isCollapsed={isCollapsed}
                />
              )
            })}
          </nav>
        </div>
      </Accordion>
    </TooltipProvider>
  )
}
