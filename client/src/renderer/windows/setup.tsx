import '../styles/globals.css';
import logo from '../assets/smnhs_logo.png';
import ReactDOM from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { WindowIdentifier } from '@/shared/constants';
import { Labaratory } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Toaster } from '../components/ui/toaster';
import { sleep } from '@/shared/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';

const formSchema = z.object({
  hostName: z.string().min(1, {
    message: "Host name is required.",
  }),
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

/**
 * Database status messages.
 *
 * @enum
 */
enum VerificationStatus {
  Verifying = 'Verifying hostname...',
  FetchingLabs = 'Fetching labs...',
  FetchingNetworkNames = 'Fetching network names...',
  Verified = 'Verification successful.',
  VerificationFailed = 'Verification failed.',
}
enum SetupStatus {
  Setup = 'Setting up device...',
  SetupFailed = 'Setup failed.',
  SetupSuccessful = 'Setup successful.',
}

function Index() {
  const [status, setStatus] = useState<VerificationStatus | SetupStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [labs, setLabs] = useState<Labaratory[]>([]);
  const [networkNames, setNetworkNames] = useState<string[]>([]);
  const [devId, setDevId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostName: "",
      deviceName: "",
      labId: "",
      networkName: "",
    },
  })

  useEffect(() => {
    const fetch = async () => {
      const deviceId = await api.store.get('deviceId') as string;
      setDevId(deviceId);
      if (deviceId) {
        api.window.open(WindowIdentifier.Splash);
        api.window.close(WindowIdentifier.Setup);
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status) {
      timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          return Math.min(oldProgress + 10, 100);
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [status]);


  const handleConnect = async () => {
    const hostName = form.getValues("hostName");
    if (!hostName) {
      setStatus(VerificationStatus.VerificationFailed);
      return;
    }

    async function fetchLab() {
      const labs = await api.database.getLabs();
      setLabs(labs);
    }

    async function fetchNetworkNames() {
      const networkNames = await api.database.getNetworkNames();
      setNetworkNames(networkNames);
    }

    setProgress(0);
    setStatus(VerificationStatus.Verifying);
    await sleep(2000);

    try {
      await api.database.verifyHostName(hostName);
      await api.database.connect();

      setStatus(VerificationStatus.FetchingLabs);
      await fetchLab();
      await sleep(2000);

      setStatus(VerificationStatus.FetchingNetworkNames);
      await fetchNetworkNames();

      setStatus(VerificationStatus.Verified);
    } catch (error) {
      setStatus(VerificationStatus.VerificationFailed);
      setLabs([]);
      setNetworkNames([]);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus(SetupStatus.Setup);
    setProgress(0);
    try {
      api.database.registerDevice(values.deviceName, values.labId, values.networkName).then(() => {
        return sleep(1000);
      }).then(() => {
        api.window.open(WindowIdentifier.Splash);
        api.window.close(WindowIdentifier.Setup);
        setStatus(SetupStatus.SetupSuccessful);
        return Promise.resolve();
      });
    } catch (error) {
      console.error("Setup failed:", error);
      setStatus(SetupStatus.SetupFailed);
    }
  }

  const handleExit = () => {
    api.window.close(WindowIdentifier.Setup);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="text-center space-y-4 pb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <img src={logo} alt="Logo" className="h-24 mx-auto rounded-full border-4 border-white shadow-lg" />
          <CardTitle className="text-3xl font-bold">Device Setup</CardTitle>
          <CardDescription className="text-lg text-blue-100">
            Let's get your device ready!
            {devId}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className='flex space-x-2'>
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel className="text-sm font-medium text-gray-700">Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter host name" {...field} className="bg-white border-2 border-blue-200 rounded-lg focus:border-purple-400 transition duration-300" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
                <Button onClick={handleConnect} className="bg-blue-500 hover:bg-blue-600 text-white self-end rounded-lg transition duration-300 transform hover:scale-105">
                  Connect
                </Button>
              </div>
              {labs.length > 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="deviceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Device name" {...field} className="bg-white border-2 border-blue-200 rounded-lg focus:border-purple-400 transition duration-300" />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
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
                            <SelectTrigger className="bg-white border-2 border-blue-200 rounded-lg focus:border-purple-400 transition duration-300">
                              <SelectValue placeholder="Select a lab" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {labs.map((lab) => (
                              <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
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
                            <SelectTrigger className="bg-white border-2 border-blue-200 rounded-lg focus:border-purple-400 transition duration-300">
                              <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {networkNames.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <Separator className="my-6 bg-blue-200" />
                </>)}
              <div className="flex flex-col space-y-3">
                {labs.length > 0 && <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition duration-300 transform hover:scale-105">
                  Setup Device
                </Button>}
                <Button type="button" variant="outline" onClick={handleExit}
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition duration-300">
                  Exit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Dialog open={!!status} onOpenChange={() => setStatus(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600">{status}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Progress value={progress} className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </Progress>
          </div>
        </DialogContent>
      </Dialog>
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
