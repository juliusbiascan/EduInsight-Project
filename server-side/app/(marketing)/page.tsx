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
  weight: ["400", "500", "600", "700"]
})

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect("/redirect")
  }

  return (
    <main className={cn("min-h-screen bg-gradient-to-b from-blue-900 to-blue-700", font.className)}>
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <Image src="/smnhs_logo.png" alt="SMNHS Logo" width={80} height={80} />
          <LoginButton>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Sign in
            </Button>
          </LoginButton>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              EduInsight
            </h1>
            <p className="text-xl md:text-2xl">
              Advanced Computer Lab Monitoring System for San Miguel National High School
            </p>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-100">
                <Link href="/scan">Quick Scan</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
                Learn More
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Image src="/welcome_bg.jpg" alt="Computer Lab" width={600} height={400} className="rounded-lg shadow-lg" />
          </div>
        </div>

        <section className="mt-24 text-white">
          <h2 className="text-3xl font-semibold mb-8 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Real-time Monitoring", description: "Track student activities and computer usage in real-time" },
              { title: "Performance Analytics", description: "Gain insights into student performance and lab efficiency" },
              { title: "Secure Access Control", description: "Ensure authorized access to computer resources" }
            ].map((feature, index) => (
              <div key={index} className="bg-blue-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
