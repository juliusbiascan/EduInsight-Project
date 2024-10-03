import { BrowserWindow } from "electron";
import url from "url";
import path from "path";
import { WindowIdentifier } from '../../shared/constants';

export const createWelcomeWindow = (firstName: string, lastName: string) => {
  let welcomeWindow = new BrowserWindow({
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
    pathname: path.join(__dirname, 'html/welcome.html'),
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

  function fadeOut(callback: () => void) {
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


/**
 * @interface
 */
interface WindowConfig {
  id: string;
  url: string;
  options: Electron.BrowserWindowConstructorOptions;
}


/**
 * BrowserWindow base configuration.
 *
 * @constant
 */
const kioskWindowConfig: Electron.BrowserWindowConstructorOptions = {
  kiosk: true,
  focusable: true,
  // closable: false,
  fullscreen: true,
  show: true,
  frame: false,
  resizable: false,
  minimizable: false,
  maximizable: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    allowRunningInsecureContent: true,
    webSecurity: false,
  }
};


/**
 * BrowserWindow base configuration.
 *
 * @constant
 */
const baseWindowConfig: Electron.BrowserWindowConstructorOptions = {
  backgroundColor: 'whitesmoke',
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
};

/**
 * BrowserWindow shared configurations.
 *
 * @constant
 */
const sharedWindowConfigs: Record<string, Electron.BrowserWindowConstructorOptions> = {
  frameless: {
    ...baseWindowConfig,
    frame: false,
    maximizable: false,
    resizable: false,
    movable: false,
    minimizable: false,
  },
};

/**
 * Contains a collection of the BrowserWindow instances created.
 *
 * Each instance is stored by a unique name
 * so it can later be retrieved on by name.
 *
 * @constant
 */
const windows: Record<string, Electron.BrowserWindow> = {};

/**
 * Holds application window configs.
 *
 * @constant
 */
const WINDOW_CONFIGS: Record<string, WindowConfig> = {
  [WindowIdentifier.Main]: {
    id: WindowIdentifier.Main,
    url: MAIN_WINDOW_WEBPACK_ENTRY,
    options: {
      ...kioskWindowConfig,
    },
  },
  [WindowIdentifier.SomethingWentWrong]: {
    id: WindowIdentifier.SomethingWentWrong,
    url: SWW_WINDOW_WEBPACK_ENTRY,
    options: {
      ...kioskWindowConfig,
    },
  },
  [WindowIdentifier.Down]: {
    id: WindowIdentifier.Down,
    url: DOWN_WINDOW_WEBPACK_ENTRY,
    options: {
      ...kioskWindowConfig,
    },
  },
  [WindowIdentifier.Setup]: {
    id: WindowIdentifier.Setup,
    url: SETUP_WINDOW_WEBPACK_ENTRY,
    options: {
      ...sharedWindowConfigs.frameless,
      height: 600,
      width: 500,
      transparent: true,
      backgroundColor: '#00000000',
    },
  },
  [WindowIdentifier.Splash]: {
    id: WindowIdentifier.Splash,
    url: SPLASH_WINDOW_WEBPACK_ENTRY,
    options: {
      ...sharedWindowConfigs.frameless,
      height: 400,
      width: 300,
    },
  },
  [WindowIdentifier.Maintainance]: {
    id: WindowIdentifier.Maintainance,
    url: MAINTAINANCE_WINDOW_WEBPACK_ENTRY,
    options: {
      ...kioskWindowConfig,
    },
  },
  [WindowIdentifier.Dashboard]: {
    id: WindowIdentifier.Dashboard,
    url: DASHBOARD_WINDOW_WEBPACK_ENTRY,
    options: {
      ...baseWindowConfig,
      minWidth: 300,
      width: 650,
      minHeight: 700,
      height: 700,
      show: false,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
    },
  },
  [WindowIdentifier.QuizTeacher]: {
    id: WindowIdentifier.QuizTeacher,
    url: QUIZ_TEACHER_WINDOW_WEBPACK_ENTRY,
    options: {
      ...baseWindowConfig,
      show: true,
      frame: false,
      transparent: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      height: 600,
      width: 1080,
    },
  },
  [WindowIdentifier.QuizPlayer]: {
    id: WindowIdentifier.QuizPlayer,
    url: QUIZ_PLAYER_WINDOW_WEBPACK_ENTRY,
    options: {
      ...kioskWindowConfig,
    },
  },
  [WindowIdentifier.Settings]: {
    id: WindowIdentifier.Settings,
    url: null,
    options: {
      ...sharedWindowConfigs.frameless,
      height: 600,
      width: 500,
    },
  },
};

/**
 * Creates the BrowserWindow. Re-uses existing
 * window if it has already been created.
 *
 * @function
 * @param id      The unique identifier for the window.
 * @param url     The url to the window's html page.
 * @param options Browser Window options object.
 */
function create(id: string, url: string, options: Electron.BrowserWindowConstructorOptions) {

  // if the provided screen id already exists with
  // an active handle then return that instead
  if (windows[id]) {
    return windows[id];
  }



  // create the browser window
  const window = new BrowserWindow(options);

  window.loadURL(url);

  window.webContents.on("before-input-event",
    (event, input) => {
      if (input.code === 'F4' && input.alt) {
        event.preventDefault();
      } else if (input.control && input.alt && input.code === "DELETE") {
        event.preventDefault();
      }
    }
  );

  if (id === WindowIdentifier.Dashboard) {
    window.on('blur', () => {
      window.hide();
    });
  }

  // de-reference the window object when its closed
  window.on('closed', () => delete windows[id]);

  // add to the collection of window objects
  windows[id] = window;
  return window;
}

/**
 * Gets a window by specified id.
 *
 * Creates it if it does not already exist.
 *
 * @function
 * @param id The id of the window.
 */
function get(id: string) {
  if (id in windows) {
    return windows[id];
  }

  // create the window using its found config
  const config = WINDOW_CONFIGS[id];
  return create(id, config.url, config.options);
}



/**
 * Exports this module.
 *
 * @exports
 */
export default {
  create,
  get,
  WINDOW_CONFIGS,
};