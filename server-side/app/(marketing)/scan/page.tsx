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
import { useState, useTransition } from "react"
import { getDeviceById } from "@/data/device"
import { ClockInSchema } from "@/schemas"
import { clockIn } from "@/actions/clock-in"

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

        clockIn(val)
          .then((data) => {
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
          <Button type="submit">Go</Button>
        </form>
      </Form>
    </>
  )
}
