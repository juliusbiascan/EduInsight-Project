'use client'

import { useEffect, useState } from "react";
// import { ws } from "@/lib/ws";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const RemoteClient = () => {

  // const [isDrag, setIsDrag] = useState<boolean>(false);
  // const remoteId = 'test';
  // const [imgSrc, setImgSrc] = useState<string>()

  // useEffect(() => {
  //   ws.emit("join-server", remoteId);
  //   ws.on("screen-data", (remoteId: string, imgStr: string) => {
  //     console.log(imgStr);
  //     //setImgSrc("data:image/png;base64," + data)
  //   })
  // }, []);

  // const handleMouseMove = (e: any) => {
  //   if (isDrag) {
  //     ws.emit('mouse-drag', {
  //       remoteId: remoteId,
  //       move: {
  //         direction: "down",
  //         clientX: e.clientX - e.target.offsetLeft,
  //         clientY: e.clientY - e.target.offsetTop,
  //         clientWidth: e.target.clientWidth,
  //         clientHeight: e.target.clientHeight
  //       }
  //     })
  //   } else {
  //     ws.emit('mouse-move', {
  //       remoteId: remoteId,
  //       move: {
  //         clientX: e.clientX - e.target.offsetLeft,
  //         clientY: e.clientY - e.target.offsetTop - 56,
  //         clientWidth: e.target.clientWidth,
  //         clientHeight: e.target.clientHeight
  //       }
  //     })
  //   }
  // }

  // const handleMouseDown = (e: any) => {
  //   setIsDrag(true)
  //   const button = e.buttons === 2 ? "right" : (e.buttons === 4 ? "middle" : "left");
  //   ws.emit('mouse-click', { remoteId, button: { button, double: e.detail === 2 ? true : false } })
  // }

  // const handleMouseUp = (e: any) => {
  //   setIsDrag(false)
  //   ws.emit('mouse-drag', {
  //     remoteId: remoteId,
  //     move: {
  //       direction: "up",
  //       clientX: e.clientX - e.target.offsetLeft,
  //       clientY: e.clientY - e.target.offsetTop,
  //       clientWidth: e.target.clientWidth,
  //       clientHeight: e.target.clientHeight
  //     }
  //   })
  // }

  // const handleMouseScroll = (e: any) => {
  //   ws.emit('mouse-scroll', { remoteId, delta: { deltaX: e.deltaX, deltaY: e.deltaY } })
  // }

  // const handleKeyDown = (e: any) => {
  //   let mainKey = '', secondKey: any = [];
  //   e.shiftKey && secondKey.push("shift")
  //   e.ctrlKey && secondKey.push("command")
  //   e.altKey && secondKey.push("alt")

  //   if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter" || e.key === "Tab" || e.key === "Escape"
  //     || e.key === "Home" || e.key === "End" || e.key === "PageUp" || e.key === "PageDown" || e.key === "F1" || e.key === "F2"
  //     || e.key === "F3" || e.key === "F4" || e.key === "F5" || e.key === "F6" || e.key === "F7" || e.key === "F8" || e.key === "F9"
  //     || e.key === "F10" || e.key === "F11" || e.key === "F12" || e.key === "Control" || e.key === "Alt") {
  //     mainKey = e.key.toLowerCase()
  //   }
  //   else if (e.key === "ArrowUp") {
  //     mainKey = "up"
  //   } else if (e.key === "ArrowDown") {
  //     mainKey = "down"
  //   } else if (e.key === "ArrowLeft") {
  //     mainKey = "left"
  //   } else if (e.key === "ArrowRight") {
  //     mainKey = "right"
  //   } else if (e.key === " ") {
  //     mainKey = "space"
  //   } else if (e.key === "Meta") {
  //     mainKey = "command"
  //   } else {
  //     mainKey = e.key.toLowerCase()
  //   }
  //   ws.emit('keyboard-event', { remoteId, key: [mainKey, secondKey] })
  // }

  return (
    <>
      {/* <div
        style={{
          display: 'block',
          minHeight: 'calc(100% - 56px)',
          margin: 0,
          cursor: 'none'
        }}
      >
        {imgSrc ?
          <Image
            style={{ position: 'absolute', maxHeight: '100%', maxWidth: '100%', outline: '0 !important' }} tabIndex={-1}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleMouseScroll}
            onKeyDown={handleKeyDown}
            src={imgSrc}
            fill
            alt={"screen"} /> : <Skeleton className="h-screen w-full" />
        }</div> */}
    </>
  );
}

export default RemoteClient;