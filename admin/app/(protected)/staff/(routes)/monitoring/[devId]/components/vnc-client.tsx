"use client"

import Image from "next/image";
import { Device } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import { Loader2 } from "lucide-react";

interface VncClientProps {
  device: Device;
}

export const VncClient: React.FC<VncClientProps> = ({
  device
}) => {
  const devId = device.id;
  const devHostname = device.devHostname;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const emitMouseEvent = useCallback((eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, { remoteId: devId, ...data });
    }
  }, [devId, socket]);

  const handleScreencastData = useCallback((imgStr: string) => {
    setImgSrc("data:image/png;base64," + imgStr);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      emitMouseEvent("mouse-move", { move: { x, y } });
    }
  }, [emitMouseEvent]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    emitMouseEvent("mouse-down", { button: e.button });
  }, [emitMouseEvent]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    emitMouseEvent("mouse-up", { button: e.button });
  }, [emitMouseEvent]);

  const handleMouseWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    emitMouseEvent("mouse-scroll", { delta: { x: e.deltaX, y: e.deltaY } });
  }, [emitMouseEvent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    emitMouseEvent("keyboard-event", { key: e.key });
  }, [emitMouseEvent]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const newSocket = io(`https://${devHostname}:4000`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-server", devId);
      newSocket.emit("start-screencast", devId);
    });

    newSocket.on("screencast-data", handleScreencastData);

    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      toast.error("Failed to connect to the remote device. Please try again.");
    });

    return () => {
      newSocket.off("screencast-data", handleScreencastData);
      newSocket.emit("stop-screencast", devId);
      newSocket.disconnect();
    };
  }, [devHostname, devId, handleScreencastData]);

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardContent className="p-0">
        <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Remote Device: {device.name}</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{socket?.connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div
          ref={containerRef}
          className={`relative ${isFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[80vh]'} w-full bg-black`}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleMouseWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{ cursor: 'none' }}
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              layout="fill"
              objectFit="contain"
              alt="screencast"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-400">Connecting...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}