import {
  File,
  Inbox,
  LucideIcon,
  PanelsTopLeft,
  Monitor,
  UserPlus2,
} from "lucide-react"

export interface NavItem {
  title: string
  label?: string
  icon: LucideIcon
  route?: string
  children?: ChildNavItem[]
}

export interface ChildNavItem {
  title: string
  label?: string
  route: string
}

export interface NavHeader {
  heading: string
}

export type SidebarItem = NavItem | NavHeader

const basePath = "/staff"

export const sidebarItems: SidebarItem[] = [
  { heading: "Overview" },
  {
    title: "Dashboard",
    icon: PanelsTopLeft,
    route: basePath,
  },
  { heading: "Apps & Pages" },
  {
    title: "In/Out",
    icon: Inbox,
    route: `${basePath}/in-out`,
  },
  {
    title: "Monitoring",
    icon: Monitor,
    children: [
      { title: "Overview", route: `${basePath}/monitoring` },
      { title: "Power Monitoring Logs", route: `${basePath}/powerlogs` },
      { title: "User Activity History", route: `${basePath}/activityhistory` },
    ],
  },
  {
    title: "Auth",
    icon: UserPlus2,
    children: [{ title: "Registration", route: `${basePath}/registration` }],
  },
  { heading: "@ EduInsight 2024" },
]
