"use client"

import { useState } from 'react'
import * as z from 'zod'
import { Button } from "@/components/ui/button";
import { Trash, UserPlus, Save } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegistrationFormProps {
  initialData: User | null;
}

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  isTwoFactorEnabled: z.boolean().default(false).optional()
})

type RegistrationFormValues = z.infer<typeof formSchema>;

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialData,
}) => {

  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Staff' : 'Register Staff'
  const description = initialData ? 'Edit a staff member' : 'Add a new staff member'
  const toastMessage = initialData ? 'Staff updated.' : 'Staff created.'
  const action = initialData ? 'Save changes' : 'Register'

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name!,
      email: initialData.email!,
      isTwoFactorEnabled: initialData.isTwoFactorEnabled!,
    } : {
      name: '',
      email: '',
      isTwoFactorEnabled: false
    }
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.labId}/users/${params.userId}`, data)
      } else {
        await axios.post(`/api/${params.labId}/users`, data)
      }
      router.push(`/admin/${params.labId}/staff`);
      toast.success(toastMessage)
      router.refresh();
    } catch (error: any) {
      toast.error(`Something Went Wrong: ${error.message}`);
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.labId}/users/${params.userId}`)
      router.push(`/admin/${params.labId}/users`)
      toast.success("Account deleted.")
      router.refresh();
    } catch (err) {
      toast.error(`Something Went Wrong: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-pink-400 to-purple-500 text-white p-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {initialData ? <Save className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          {title}
        </CardTitle>
        <p className="text-pink-100">{description}</p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-600">Name</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder='Enter name' {...field} className="border-2 border-pink-200 focus:border-purple-400 rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-600">Email</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder='Enter email' {...field} className="border-2 border-pink-200 focus:border-purple-400 rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isTwoFactorEnabled"
              render={({ field }) => (
                <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border-2 border-pink-200 rounded-lg'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-purple-400 text-purple-600"
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel className="text-purple-600">
                      Two-Factor Authentication
                    </FormLabel>
                    <FormDescription>
                      Enable for enhanced security
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-6">
              {initialData && (
                <Button variant="destructive" size="sm" onClick={onDelete} disabled={loading} className="bg-pink-500 hover:bg-pink-600">
                  <Trash className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              )}
              <Button disabled={loading} type='submit' className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                {loading ? 'Processing...' : action}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}