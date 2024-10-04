"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Device } from "@prisma/client";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VncClientProps {
  device: Device;
}

export const VncClient: React.FC<VncClientProps> = ({
  device
}) => {
  const devId = device.id;
  const devHostname = device.devHostname;
  const [socket, setSocket] = useState<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emitMouseEvent = useCallback((eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, { remoteId: devId, ...data });
    }
  }, [devId, socket]);

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
    const newSocket = io(`https://${devHostname}:4000`, {
      transports: ['websocket'],
      rejectUnauthorized: false
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join-server", devId);
      newSocket.emit("start-sharing", devId);
      setIsConnected(true);
    });

    newSocket.on("screen-share", ({ deviceId, screenData }) => {
      if (deviceId === devId && canvasRef.current) {
        // Clean up the received data
        let cleanedData = screenData;

        // Remove any data URL prefixes
        const dataUrlPrefixes = [
          'data:image/jpeg;base64,',
          'data:image/png;base64,',
          'data:image/webp;base64,',
        ];

        dataUrlPrefixes.forEach(prefix => {
          cleanedData = cleanedData.replace(new RegExp(`^${prefix}`, 'g'), '');
        });

        // Remove any non-base64 characters
        cleanedData = cleanedData.replace(/[^A-Za-z0-9+/=]/g, '');

        if (cleanedData) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) {
              // Clear the canvas before drawing the new image
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              // Draw the image to fit the canvas while maintaining aspect ratio
              const scale = Math.min(canvasRef.current.width / img.width, canvasRef.current.height / img.height);
              const x = (canvasRef.current.width / 2) - (img.width / 2) * scale;
              const y = (canvasRef.current.height / 2) - (img.height / 2) * scale;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
          };
          img.onerror = (error) => {
            console.error('Error loading image:', error);
            setError(`Error loading image: ${error.toString()}`);
          };
          img.src = `data:image/png;base64,${cleanedData}`;
        }
      }
    });

    return () => {
      newSocket.emit("stop-sharing", devId);
      newSocket.disconnect();
    };
  }, [devHostname, devId]);

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardContent className="p-0">
        <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Remote Device: {device.name}</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
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
          {isConnected ? (
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
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