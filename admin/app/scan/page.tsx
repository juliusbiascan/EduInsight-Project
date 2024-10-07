"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getDeviceUserById, getDeviceUserBySchoolId } from "@/data/user"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { ScannerModal } from "@/components/modals/scanner-modal"
import { useCallback, useEffect, useState, useTransition } from "react"
import { getDeviceById } from "@/data/device"
import { ClockInSchema } from "@/schemas"
import { clockIn } from "@/actions/clock-in"
import React from "react"
import { io, Socket } from "socket.io-client"

const formSchema = z.object({
  studId: z.string().min(2, {
    message: "StudentID must be at least 2 characters.",
  }),
})

export default function ProfileForm() {

  const router = useRouter();
  const [getStudId, setStudId] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      rejectUnauthorized: false
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setServerStatus('online');
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setIsConnected(false);
      setServerStatus('offline');
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setServerStatus('offline');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const emitEvent = useCallback((eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, { ...data });
    }
  }, [socket]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studId: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { studId } = values;

    const user = await getDeviceUserBySchoolId(values.studId);

    console.log(studId);

    if (!user) {
      toast("No user found, Please contact admin or staff to register!")
      return;
    }

    setStudId(user.id);
    setOpen(true);
  }

  const onResult = async (devId: string) => {

    setError("");
    setSuccess("");

    if (socket) {
      socket.emit("join-server", devId);
    }

    startTransition(async () => {
      try {
        const device = await getDeviceById(devId)
        if (!device) {
          toast.error("No Device Found.")
          return
        }

        const val: z.infer<typeof ClockInSchema> = {
          userId: getStudId,
          deviceId: device.id,
        }

        if (socket) clockIn(val)
          .then((data) => {
            if (data && 'state' in data) {
              if (data.state === 'login') {
                const deviceId = data.deviceId;
                const userId = data.userId;
                emitEvent('login-user', { deviceId: deviceId, userId: userId });
              } else if (data.state === 'logout') {
                const deviceId = data.deviceId;
                const userId = data.userId;
                emitEvent('logout-user', { deviceId: deviceId, userId: userId });
              }
            }
            router.refresh();
          });
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong.');
      } finally {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <ScannerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onResult={(result) => onResult(result)}
        loading={isPending} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-8">
          <FormField
            control={form.control}
            name="studId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="21-0101" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public student id.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Server: {serverStatus}</span>
            </div>
          </div>

          <Button type="submit">Go</Button>
        </form>
      </Form>
    </>
  )
}
