const { app, Tray, Menu, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const { screen } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const robot = require('@jitsi/robotjs');
const screenshot = require('screenshot-desktop');
const iconPath = path.join(__dirname, 'icon.ico');
const getmac = require('getmac');
const cors = require('cors');
const express = require('express');
const activeWindows = require('electron-active-window');
const expressApp = express();
const ElectronShutdownHandler = require('@paymoapp/electron-shutdown-handler').default;
const AutoLaunch = require('auto-launch');
const axios = require('axios');
const HOSTNAME = "https://localhost";
// const HOSTNAME = "https://192.168.1.142";
if (require('electron-squirrel-startup')) app.quit();

let screenSize, mouseDirection = ''
let mainWindow;
let settingsChildWindow;
let preferencesWindow;
let aboutWindow;
let welcomeWindow;
let tray;
let menu;

const privateKey = fs.readFileSync(path.join(__dirname, 'my_ssl_key.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'my_ssl_cert.crt'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: certificate,
  key: privateKey
});

const { createServer } = require('https');
const { Server } = require('socket.io');

expressApp.use(express.static(__dirname));

expressApp.get('/', function (req, res) {
  console.log('req path...', req.path)
  res.sendFile(path.join(__dirname, 'index.html'));
});

expressApp.set('port', 4000);
expressApp.use(cors({ origin: '*' }));

expressApp.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

const httpServer = createServer(credentials, expressApp);
httpServer.listen(4000, '0.0.0.0');
httpServer.on('error', () => console.log('error'));
httpServer.on('listening', () => console.log('listening.....'));
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  remoteHandler(socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});


const remoteHandler = (socket) => {

  let screencastInterval;

  const startScreencast = (deviceId) => {
    console.log("Starting screencast for room:", deviceId);
    screencastInterval = setInterval(() => {
      screenshot().then((img) => {
        const imgStr = img.toString('base64');
        io.to(deviceId).emit('screencast-data', imgStr);
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

  const joinServer = (deviceId) => {
    socket.join(deviceId);
    console.log(`Joined room: ${deviceId}`);
  };

  const mouseMove = ({ remoteId, move }) => {
    socket.to(remoteId).emit('mouse_move', move);
  }

  const mouseClick = ({ remoteId, button }) => {
    socket.to(remoteId).emit('mouse_click', button);
  }

  const mouseScroll = ({ remoteId, delta }) => {
    socket.to(remoteId).emit('mouse_scroll', delta);
  }

  const mouseDrag = ({ remoteId, move }) => {
    socket.to(remoteId).emit('mouse_drag', move);
  }

  const keyboard = ({ remoteId, key }) => {
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


function showWindow() {
  if (!mainWindow.isVisible()) {
    mainWindow.setFullScreen(true);
    mainWindow.show();
    mainWindow.focus();
  }
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    center: true,
    alwaysOnTop: true,
    title: "About",
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    backgroundColor: "#eee",
    skipTaskbar: true,
  });
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'about.html'),
    protocol: 'file',
    slashes: true
  }));
  aboutWindow.on('close', (e) => {
    e.preventDefault();
    aboutWindow.hide();
  });
}

function createPreferencesWindow() {
  preferencesWindow = new BrowserWindow({
    width: 300,
    height: 180,
    show: false,
    center: true,
    alwaysOnTop: true,
    title: "Preferences",
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    skipTaskbar: true,
  });
  preferencesWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'about.html'),
    protocol: 'file',
    slashes: true
  }))
  preferencesWindow.on('close', (e) => {
    e.preventDefault();
    preferencesWindow.hide();
  });
}

const menuTemplate = [
  {
    label: "About EduInsight",
    click: () => {
      aboutWindow.show();
    }
  },
  {
    type: "separator"
  },
  {
    label: "Preferences",
    accelerator: "Cmd+,",
    click: () => {
      preferencesWindow.show();
    }
  },
  {
    type: "separator"
  },
  {
    label: "Logout",
    click: () => {
      logOutUser();
    }
  },
]

function createMenu() {
  menu = new Menu.buildFromTemplate(menuTemplate);
}

function createTray() {
  tray = new Tray(iconPath);
  tray.on("right-click", () => {
    tray.popUpContextMenu(menu);
  })
}

function createSettingsChildWindow() {
  settingsChildWindow = new BrowserWindow({
    width: 300,
    height: 340,
    show: false,
    frame: false,
    parent: mainWindow,
    resizable: false,
    focus: true,
    skipTaskbar: true,
  });
  settingsChildWindow.on('blur', () => {
    settingsChildWindow.hide();
    mainWindow.focus();
  });
}

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
    }
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }))

  mainWindow.webContents
    .on("before-input-event",
      (event, input) => {
        if (input.code === 'F4' && input.alt) {
          event.preventDefault();
        } else if (input.control && input.alt && input.code === "DELETE") {
          event.preventDefault();
        }
      }
    );
  mainWindow.once('ready-to-show', async () => {
    try {
      const macAddress = getmac.default();
      const response = await axios.get(`${HOSTNAME}/api/clients?macAddress=${macAddress}`, { httpsAgent: httpsAgent });
      const data = await response.data;
      mainWindow.webContents.send('SET_MAC', macAddress);
      if (data && data.devId) {
        mainWindow.webContents.send('SET_ID', data.devId);
        console.log('Device ID received:', data.devId);
      } else {
        throw new Error('Device ID not found in response');
      }
    } catch (error) {
      console.error('Error fetching device ID:', error); // Set to error state
    }
  });

  mainWindow.on('blur', () => {
    if (!settingsChildWindow.isVisible()) {
      mainWindow.hide();
    }
  });
}

function setIpcListeners() {
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

function getTimeStamp() {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;

  return dateTime;
}


async function pushPowerLogsToDB(pm_status, pm_log_ts) {
  const macAddress = getmac.default();
  try {
    const { data, status } = await axios.post(`${HOSTNAME}/api/clients/power-monitoring-logs`, { macAddress, pm_status, pm_log_ts }, { httpsAgent: httpsAgent });
    io.emit("update-ui", { result: data });
    console.log("[PUSH-PM-LOGS]", status);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}

function setActivityMonitoring() {

  let activeWindow;

  setInterval(function () {

    const macAddress = getmac.default();

    activeWindows().getActiveWindow().then(async (result) => {

      const newWindow = result.windowName;

      if (activeWindow !== newWindow) {

        const data = {
          macAddress,
          os: result.os,
          windowClass: result.windowClass,
          windowName: result.windowName,
          al_log_ts: getTimeStamp(),
        }

        await axios.post(`${HOSTNAME}/api/clients/activitylogs`, data, { httpsAgent: httpsAgent })
          .then(() => {
            io.emit("update-ui", { result: data });
          }).catch(() => {
          });

        activeWindow = result.windowName;
      }
    });
  }, 1000);
}

async function logOutUser() {

  const macAddress = getmac.default();

  try {
    const { status, data } = await axios.delete(`${HOSTNAME}/api/clients/logout/${macAddress}`, { httpsAgent: httpsAgent });
    console.log(data, status);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}

function createWelcomeWindow(firstName, lastName) {
  welcomeWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  welcomeWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'welcome.html'),
    protocol: 'file:',
    slashes: true
  }));

  welcomeWindow.webContents.on('did-finish-load', () => {
    welcomeWindow.webContents.send('user-info', { firstName, lastName });
    welcomeWindow.show();
    welcomeWindow.setOpacity(0);
    fadeIn();
  });

  function fadeIn() {
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      if (opacity < 1) {
        opacity += 0.1;
        welcomeWindow.setOpacity(opacity);
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  function fadeOut(callback) {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      if (opacity > 0) {
        opacity -= 0.1;
        welcomeWindow.setOpacity(opacity);
      } else {
        clearInterval(fadeInterval);
        callback();
      }
    }, 50);
  }

  setTimeout(() => {
    if (welcomeWindow) {
      fadeOut(() => {
        welcomeWindow.close();
        welcomeWindow = null;
      });
    }
  }, 4000);
}

function setUserStateNotification() {
  let prevUserId;
  setInterval(async () => {

    const macAddress = getmac.default();

    try {

      const result = await axios.post(`${HOSTNAME}/api/clients`, { macAddress }, { httpsAgent: httpsAgent });

      const { userId, firstName, lastName } = result.data;

      if (!prevUserId && prevUserId !== userId) {

        createWelcomeWindow(firstName, lastName);
        prevUserId = userId;
        if (mainWindow.isVisible)
          mainWindow.hide();
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          prevUserId = null;
          mainWindow.webContents.send('SET_STATE', 1);
          showWindow();
        } else if (error.response.status === 404) {
          prevUserId = null;
          mainWindow.webContents.send('SET_STATE', 1);
          showWindow();
        } else if (error.response.status === 401) {
          prevUserId = null;
          mainWindow.webContents.send('SET_STATE', 2);
          showWindow();
        }
      } else if (error.request) {
        prevUserId = null;
        mainWindow.webContents.send('SET_STATE', 0);
        showWindow();
      } else {
        prevUserId = null;
        mainWindow.webContents.send('SET_STATE', 3);
        showWindow();
      }
    }
  }, 500);
}

function setPowerMonitor() {

  powerMonitor.on("suspend", () => {
    console.log("The system is going to sleep");
    pushPowerLogsToDB("0", getTimeStamp());
  });

  powerMonitor.on("resume", () => {
    console.log("The system is resuming");
    pushPowerLogsToDB("1", getTimeStamp());
  });

  powerMonitor.on("on-ac", () => {
    console.log("The system is on AC Power (charging)");
    pushPowerLogsToDB("2", getTimeStamp());
  });

  powerMonitor.on("on-battery", () => {
    console.log("The system is on Battery Power");
    pushPowerLogsToDB("3", getTimeStamp());
  });

  powerMonitor.on("shutdown", () => {
    logOutUser();
    console.log("The system is Shutting Down");
    pushPowerLogsToDB("4", getTimeStamp());
  });

  powerMonitor.on("lock-screen", () => {
    console.log("The system is about to be locked");
    pushPowerLogsToDB("5", getTimeStamp());
  });

  powerMonitor.on("unlock-screen", () => {
    console.log("The system is unlocked");
    pushPowerLogsToDB("6", getTimeStamp());
  });
}

function setShutdownListener() {
  ElectronShutdownHandler.setWindowHandle(mainWindow.getNativeWindowHandle());
  ElectronShutdownHandler.blockShutdown('Please wait for some data to be saved');

  ElectronShutdownHandler.on('shutdown', () => {
    console.log('Shutting down!');
    logOutUser();
    ElectronShutdownHandler.releaseShutdown();
    mainWindow.webContents.send('shutdown');
    app.quit();
  });
}

//Replace the existing AutoLaunch setup with this:
const autoLaunch = new AutoLaunch({
  name: 'EduInsight Client',
  path: app.getPath('exe'),
});

autoLaunch.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});

app.on('ready', () => {
  createMenu();
  createAboutWindow();
  createPreferencesWindow();
  createTray();
  createWindow();
  createSettingsChildWindow();
  setIpcListeners();
  setPowerMonitor();
  setActivityMonitoring();
  setShutdownListener();
  setUserStateNotification();
});