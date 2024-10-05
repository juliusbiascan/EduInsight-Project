import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default async function Home() {


  const session = await auth()

  if (session) {
    redirect("/redirect")
  }

  return (
    <main className="flex flex-col min-h-screen relative">
      {/* Background overlay */}
      <Image
        src="/welcome_bg.jpg"
        alt="Welcome Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/80 via-purple-500/80 to-indigo-600/80 z-10"></div>

      {/* Content wrapper */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 bg-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Image
              src="/smnhs_logo.png"
              alt="SMNHS Logo"
              width={48}
              height={48}
              className="rounded-full border-2 border-white/50"
            />
            <span className="text-white font-bold text-xl">EduInsight</span>
          </div>
          <div className="space-x-6">
            <Link href="#" className="text-white hover:text-blue-200 transition-colors duration-300">Installation</Link>
            <Link href="#" className="text-white hover:text-blue-200 transition-colors duration-300">Contact us</Link>
            <LoginButton>
              <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-blue-100 transition-colors duration-300">
                Login
              </Button>
            </LoginButton>
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <h1 className={cn(
                "text-5xl md:text-6xl font-bold text-white leading-tight",
                font.className
              )}>
                EduInsight Lab
              </h1>
              <p className="text-blue-100 text-xl leading-relaxed">
                Empowering education through technology. Track computer usage, get smart alerts, and gain insights into lab efficiency and progress.
              </p>
              <Button variant='secondary' size='lg' className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                Download ClientSetup.exe
              </Button>
            </div>

            {/* Right side - Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl"></div>
              <div className="relative z-10 p-8">
                <Image
                  src="/lab_peoples.png"
                  alt="Lab Peoples Illustration"
                  width={600}
                  height={600}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}