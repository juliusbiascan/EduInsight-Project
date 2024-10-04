import React from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserButton } from '@/components/auth/user-button'
import LabSwitcher from './lab-switcher'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { BeakerIcon, SparklesIcon } from '@heroicons/react/24/solid'

const Navbar = async () => {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const lab = await db.labaratory.findMany({
    where: {
      userId: session.user.id
    }
  })

  return (
    <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-900 dark:via-purple-900 dark:to-indigo-900 backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image src="/smnhs_logo.png" alt="SMNHS Logo" width={56} height={56} className="rounded-full border-2 border-pink-300 dark:border-pink-600 shadow-md" />
              <SparklesIcon className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
            <LabSwitcher items={lab} className="hidden md:flex" />
          </div>

          <MainNav className="hidden lg:flex mx-6" />

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserButton />
            <BeakerIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-300 animate-bounce" />
            <MobileNav>
              <LabSwitcher items={lab} className="mt-4" />
              <MainNav className="mt-4" />
            </MobileNav>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
