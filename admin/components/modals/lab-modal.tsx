"use client";

import * as z from "zod"
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField, FormItem,
  FormLabel, FormMessage
} from "@/components/ui/form";
import { useLabModal } from "@/hooks/use-lab-modal";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/logout";
import { FaFlask } from 'react-icons/fa';
import { useTheme } from "next-themes";

const formSchema = z.object({
  name: z.string().min(1),
});

export const LabModal = () => {

  const labModal = useLabModal();

  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/labaratory', values);
      window.location.assign(`/admin/${response.data.userId}`);
    } catch (error) {
      console.log('Something went wrong', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Laboratory"
      description="Add a new laboratory to manage devices and staff."
      isOpen={labModal.isOpen}
      onClose={labModal.onClose}
    >
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-purple-700' : 'bg-purple-200'}`}>
            <FaFlask className={`text-6xl ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`} />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-lg font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>Laboratory Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Enter a cute name for your lab" 
                      {...field} 
                      className={`border-2 rounded-full px-4 py-2 ${
                        theme === 'dark' 
                          ? 'border-purple-600 focus:border-purple-400 bg-purple-800 text-white' 
                          : 'border-purple-300 focus:border-purple-500 bg-white'
                      }`}
                    />
                  </FormControl>
                  <FormMessage className="text-pink-500" />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between pt-4">
              <Button 
                disabled={loading} 
                variant="outline" 
                onClick={labModal.onClose}
                className={`rounded-full border-2 ${
                  theme === 'dark'
                    ? 'border-purple-600 hover:bg-purple-800 text-purple-300'
                    : 'border-purple-300 hover:bg-purple-100 text-purple-700'
                }`}
              >
                Cancel
              </Button>
              <Button 
                disabled={loading} 
                type="submit"
                className={`rounded-full px-6 py-2 ${
                  theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Create Lab
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
