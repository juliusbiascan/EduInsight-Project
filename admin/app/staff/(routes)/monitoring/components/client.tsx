"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getAllActiveUserDevice, getAllInactiveUserDevice } from "@/data/device";
import { logoutUser } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { Rainbow, Activity, Laptop, Users, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Frown } from "lucide-react";
import { StatsCard } from '@/components/stats-card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DeviceArtwork } from "./device_artwork";
import toast from "react-hot-toast";
import { ActiveDeviceUser, Device } from "@prisma/client";
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/providers/socket-provider';

interface MonitoringClientProps {
  labId: string | null;
}

export const MonitoringClient: React.FC<MonitoringClientProps> = ({ labId }) => {
  const [allActiveDevice, setAllActiveDevice] = useState<ActiveDeviceUser[]>([]);
  const [allInactiveDevice, setAllInactiveDevice] = useState<Device[]>([]);
  const { socket } = useSocket();

  const refresh = useCallback(async () => {
    if (labId) {
      const activeDevices = await getAllActiveUserDevice(labId);
      if (activeDevices) setAllActiveDevice(activeDevices);

      const inactiveDevices = await getAllInactiveUserDevice(labId);
      if (inactiveDevices) setAllInactiveDevice(inactiveDevices);
    }
  }, [labId]);

  useEffect(() => {
    refresh();

    if (!socket) return;

    socket.on("refresh", () => {
      refresh();
    });

    return () => {
      socket.off("refresh");
    };

  }, [refresh, socket]);

  const handleLogoutAll = () => {
    allActiveDevice.forEach((activeDevice) => {
      logoutUser(activeDevice.userId, activeDevice.deviceId).then(() => {
        toast.success("All devices have been logged out successfully");
        if (socket) {
          socket.emit("logout-user", { deviceId: activeDevice.deviceId, userId: activeDevice.userId });
        }
      });
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">Monitoring</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleLogoutAll}
            disabled={allActiveDevice.length === 0}
            className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout All
          </Button>
        </div>
      </div>

      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Active Devices"
            value={allActiveDevice.length}
            icon={<Activity className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Inactive Devices"
            value={allInactiveDevice.length}
            icon={<Laptop className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Devices"
            value={allActiveDevice.length + allInactiveDevice.length}
            icon={<Users className="h-4 w-4" />}
          />
        </motion.div>
        {/* Add more stats cards as needed */}
      </motion.div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="justify-start bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
          <TabsTrigger value="active" className="rounded-full">Active Devices</TabsTrigger>
          <TabsTrigger value="inactive" className="rounded-full">Inactive Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
              <CardTitle className="text-base flex items-center">
                <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> Active Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <motion.div
                  className="flex space-x-4 pb-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {allActiveDevice.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center w-full py-8"
                        variants={itemVariants}
                        key="no-active-devices"
                      >
                        <Frown className="h-16 w-16 text-pink-300 dark:text-pink-600 mb-4" />
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">No Active Devices</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">It&apos;s quiet here... too quiet.</p>
                      </motion.div>
                    ) : (
                      allActiveDevice.map((device) => (
                        <motion.div key={device.id} variants={itemVariants}>
                          <DeviceArtwork
                            activeDevice={device}
                            className="w-[250px]"
                            aspectRatio="portrait"
                            width={250}
                            height={330}
                            onChanged={refresh}
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4">
          <Card className="overflow-hidden border border-blue-200 dark:border-blue-700 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900">
              <CardTitle className="text-base flex items-center">
                <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" /> Inactive Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <div className="flex space-x-4 pb-4">
                  {allInactiveDevice.length === 0 ? (
                    <p>No Inactive Devices</p>
                  ) : (
                    allInactiveDevice.map((device) => (
                      <DeviceArtwork
                        key={device.id}
                        inactiveDevice={device}
                        className="w-[150px]"
                        aspectRatio="square"
                        width={150}
                        height={150}
                        onChanged={refresh}
                      />
                    ))
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
