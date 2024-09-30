import { Socket } from "socket.io";
import screenshot from 'screenshot-desktop';


interface IMouseClick {
  remoteId: string,
  button: {
    button: string,
    double: boolean
  }
}

export const remoteHandler = (socket: Socket) => {

  let screencastInterval: ReturnType<typeof setInterval>;

  const startScreencast = (deviceId: string) => {
    console.log("Starting screencast for room:", deviceId);
    screencastInterval = setInterval(() => {
      screenshot().then((img) => {
        const imgStr = img.toString('base64');
        socket.to(deviceId).emit('screencast-data', imgStr);
        console.log("Sent screencast data to room:", deviceId);
      }).catch(err => {
        console.error("Screenshot error:", err);
      });
    }, 1000); // Send screenshot every second
  };

  const stopScreencast = () => {
    clearInterval(screencastInterval);
    console.log("Screencast stopped");
  };
  const joinServer = (deviceId: string) => {
    socket.join(deviceId)
  };

  const mouseMove = ({ remoteId, move }: { remoteId: string, move: any }) => {
    socket.to(remoteId).emit('mouse_move', move);
  }

  const mouseClick = ({ remoteId, button }: IMouseClick) => {
    socket.to(remoteId).emit('mouse_click', button);
  }

  const mouseScroll = ({ remoteId, delta }: { remoteId: string, delta: any }) => {
    socket.to(remoteId).emit('mouse_scroll', delta);
  }

  const mouseDrag = ({ remoteId, move }: { remoteId: string, move: any }) => {
    socket.to(remoteId).emit('mouse_drag', move);
  }

  const keyboard = ({ remoteId, key }: { remoteId: string, key: string[] }) => {
    socket.to(remoteId).emit('keyboard', key);
  }

  socket.on("join-server", joinServer)
  socket.on("mouse-move", mouseMove)
  socket.on("mouse-click", mouseClick)
  socket.on("mouse-scroll", mouseScroll)
  socket.on("mouse-drag", mouseDrag)
  socket.on("keyboard-event", keyboard)
  socket.on("start-screencast", startScreencast);
  socket.on("stop-screencast", stopScreencast);
}