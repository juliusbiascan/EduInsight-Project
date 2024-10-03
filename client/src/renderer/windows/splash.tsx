import '../styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { IPCRoute, WindowIdentifier } from '../../shared/constants';
import { sleep } from '../../shared/utils';

/**
 * Database status messages.
 *
 * @enum
 */
enum DatabaseStatus {
  Connecting = 'Connecting to database...',
  Connected = 'Connected.',
}

/**
 * Updater status messages.
 *
 * @enum
 */
enum UpdaterStatus {
  Checking = 'Checking for updates...',
  Downloading = 'Downloading update...',
  Finished = 'Download finished.',
  NoUpdates = 'No updates available.',
}


/**
 * The index component
 *
 * @component
 */
function Index() {
  const [status, setStatus] = React.useState<DatabaseStatus | UpdaterStatus>(
    UpdaterStatus.Checking
  );

  // the updater is heavily event-driven so wrap it in a promise
  // to hold the app here while it runs through its lifecycle
  React.useEffect(() => {
    sleep(2000).then(
      () =>
        new Promise((resolve) => {
          api.updater.start();
          api.updater.on(IPCRoute.UPDATER_NO_UPDATE, () =>
            resolve(setStatus(UpdaterStatus.NoUpdates))
          );
          api.updater.on(IPCRoute.UPDATER_DOWNLOADING, () => setStatus(UpdaterStatus.Downloading));
          api.updater.on(IPCRoute.UPDATER_FINISHED, () =>
            resolve(setStatus(UpdaterStatus.Finished))
          );
        })
    );
  }, []);

  // if there was an update download then
  // trigger a restart of the application
  React.useEffect(() => {
    if (status !== UpdaterStatus.Finished) {
      return;
    }

    api.updater.install();
  }, [status]);

  // if no updates were downloaded, we can
  // proceed connecting to the database
  React.useEffect(() => {
    if (status !== UpdaterStatus.NoUpdates) {
      return;
    }

    sleep(2000)
      .then(() => {
        setStatus(DatabaseStatus.Connecting);
        return sleep(2000);
      })
      .then(() => {

      })
      .then(() => sleep(2000))
      .then(() => {
        return Promise.resolve(setStatus(DatabaseStatus.Connected));
      })
      .then(() => sleep(2000))
      .then(() => {
        api.window.open(WindowIdentifier.Setup);
        api.window.close(WindowIdentifier.Splash);
      });
  }, [status]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{status}</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
      </div>
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