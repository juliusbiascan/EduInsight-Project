/**
 * BrowserWindow IPC handlers.
 *
 * @module
 */
import { ipcMain } from 'electron';
import * as robot from "@jitsi/robotjs"
import { IPCRoute } from '@/shared/constants';
import { db } from '@/shared/db';
import { machineIdSync } from 'node-machine-id';
/**
 * Register the IPC event handlers.
 *
 * @function
 */
export default function () {
  let mouseDirection: string;
  let screenSize: { width: number; height: number };


  ipcMain.on('mouse_move', (e, { clientX, clientY, clientWidth, clientHeight }) => {
    const { width, height } = screenSize

    const hostX = clientX * width / clientWidth
    const hostY = clientY * height / clientHeight

    robot.moveMouse(hostX, hostY)
  })

  ipcMain.on('mouse_click', (e, data) => {
    if (data) {
      robot.mouseClick(data.button, data.double)
    }
  })

  ipcMain.on('mouse_scroll', (e, { deltaX, deltaY }) => {
    robot.scrollMouse(deltaX, deltaY)
  })

  ipcMain.on('mouse_drag', (e, { direction, clientX, clientY, clientWidth, clientHeight }) => {
    if (direction !== mouseDirection) {
      mouseDirection = direction
      robot.mouseToggle(direction)
    }
    const { width, height } = screenSize

    const hostX = clientX * width / clientWidth
    const hostY = clientY * height / clientHeight

    robot.dragMouse(hostX, hostY)
  })

  ipcMain.on('key_press', (e, keys) => {
    try {
      // if(key[1] && (key[0].toLowerCase() !== key[1].toLowerCase())) {
      if (keys[1].length > 0 && (keys[0].toLowerCase() !== keys[1][0].toLowerCase())) {
        robot.keyToggle(keys[0], "down", keys[1])
        robot.keyToggle(keys[0], "up", keys[1])
        // robot.keyTap(keys[0], keys[1])
      } else if (keys[1].length === 0) {
        robot.keyTap(keys[0])
      }
    } catch (e) {
      console.error(e)
    }
  })
}