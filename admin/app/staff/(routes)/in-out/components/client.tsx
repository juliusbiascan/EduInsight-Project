"use client"

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { DeviceUserForm } from "@/schemas";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ClockInModal } from "@/components/modals/clockin-modal";
import { Rainbow, UserPlus, Users, Activity } from "lucide-react";
import { StatsCard } from '@/components/stats-card';

const InOutClient = () => {
  const [open2, setOpen2] = useState('');
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof DeviceUserForm>>({
    resolver: zodResolver(DeviceUserForm),
    defaultValues: { schoolId: '' }
  });

  const onSubmit = async (data: z.infer<typeof DeviceUserForm>) => {
    setError(""); setSuccess("");
    startTransition(async () => {
      try { setOpen2(data.schoolId); }
      catch (err) { console.log(err); toast.error(`Something went wrong.`); }
    });
  }

  const onConfirm = (error: string | undefined, success: string | undefined) => {
    setError(error); setSuccess(success); setOpen2('');
  }

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">In/Out</h1>
        </div>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        <StatsCard title="Active Users" value={0} icon={<Activity className="h-4 w-4" />} />
        <StatsCard title="Total Users" value={0} icon={<Users className="h-4 w-4" />} />
        <StatsCard title="New Users Today" value={0} icon={<UserPlus className="h-4 w-4" />} />
      </div>
      <Separator className="my-4" />
      <FormError message={error} />
      <FormSuccess message={success} />
      <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
          <CardTitle className="text-base flex items-center">
            <UserPlus className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Manual Input
          </CardTitle>
          <CardDescription>Input School ID to search users to login</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
              <FormField control={form.control} name="schoolId" render={({ field }) => (
                <FormItem>
                  <FormLabel>School ID</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder='Input school id' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button disabled={isPending} className='w-full bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600' type='submit'>Search</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <ClockInModal isOpen={open2 != ''} onClose={() => setOpen2('')} onConfirm={onConfirm} loading={isPending} userId={open2} />
    </div>
  );
}

export default InOutClient;