import '../styles/globals.css';
import logo from '../assets/smnhs_logo.png';
import ReactDOM from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { WindowIdentifier } from '@/shared/constants';
import { Labaratory } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Toaster } from '../components/ui/toaster';
import { useToast } from '../hooks/use-toast';
import { sleep } from '@/shared/utils';

const formSchema = z.object({
  deviceName: z.string().min(1, {
    message: "Device name is required.",
  }),
  labId: z.string().min(1, {
    message: "Please select a lab.",
  }),
  networkName: z.string().min(1, {
    message: "Please select a network.",
  }),
})

function Index() {
  const [labs, setLabs] = useState<Labaratory[]>([]);
  const [networkNames, setNetworkNames] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: "",
      labId: "",
      networkName: "",
    },
  })

  useEffect(() => {
    api.database.getLabs().then(setLabs);
    api.database.getNetworkNames().then(setNetworkNames);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Device Name:", values.deviceName);
      console.log("Selected Lab ID:", values.labId);
      console.log("Selected Network Name:", values.networkName);

      api.database.registerDevice(values.deviceName, values.labId, values.networkName)
      toast({
        title: "Setup Successful",
        description: "Your device has been setup successfully.",
      });
      sleep(1000).then(() => {
        api.window.close(WindowIdentifier.Setup);
      })
    } catch (error) {
      console.error("Setup failed:", error);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your device. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleExit = () => {
    api.window.close(WindowIdentifier.Setup);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <img src={logo} alt="Logo" className="h-16 mx-auto" />
          <CardTitle className="text-xl font-bold text-gray-800">Device Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter device name" {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="labId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Lab</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a lab" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labs.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="networkName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {networkNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between pt-4">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2">
                  Setup Device
                </Button>
                <Button type="button" variant="outline" onClick={handleExit}
                  className="border-red-500 text-red-500 hover:bg-red-50 text-sm px-4 py-2">
                  Exit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

/**
 * React bootstrapping logic.
 *
 * @function
 * @name anonymous
 */
(() => {
  // grab the root container
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Failed to find the root element.');
  }

  // render the react application
  ReactDOM.createRoot(container).render(<Index />);
})();
