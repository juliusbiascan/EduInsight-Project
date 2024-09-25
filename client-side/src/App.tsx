import './App.css';
import './icon.ico';
import { useEffect, useState } from 'react'
import { io } from './ws';
import ScanPage from './components/scan-page';

declare global {
  interface Window {
    electronAPI?: any
  }
}

function App() {

  const [getState, setState] = useState<number>(0);
  const [macAddress, setMacAddress] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {

    window.electronAPI.getMacAddress((event: any, macAddress: string) => {
      setMacAddress(macAddress);
    })

    window.electronAPI.getDeviceId((event: any, deviceId: string) => {
      setDeviceId(deviceId);
    })

    window.electronAPI.getUserState((event: any, state: number) => {
      setState(state);
    })

    io.on('mouse_move', ({ clientX, clientY, clientWidth, clientHeight }) => {
      window.electronAPI.mouseMove({ clientX, clientY, clientWidth, clientHeight })
    })

    io.on('mouse_click', (button) => {
      window.electronAPI.mouseClick(button)
    })

    io.on('mouse_scroll', ({ deltaX, deltaY }) => {
      window.electronAPI.mouseScroll({ deltaX, deltaY })
    })

    io.on('mouse_drag', ({ direction, clientX, clientY, clientWidth, clientHeight }) => {
      window.electronAPI.mouseDrag({ direction, clientX, clientY, clientWidth, clientHeight })
    })

    io.on('keyboard', (key) => {
      window.electronAPI.keyPress(key)
    })

    return () => {
      io.off("mouse_move");
      io.off("mouse_click");
      io.off('mouse_scroll');
      io.off('mouse_drag');
      io.off("key board");
      io.off('stop_sharing');
      io.off('stop_remote');
    };
  }, []);

  return (
    <div className="container mx-auto flex flex-col">
      {getState === 0 && (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
          <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
            <img src='./icon.ico' alt='logo' className='mx-auto w-24 h-24 mb-6' />
            <h1 className='text-3xl font-bold text-yellow-600 mb-4'>We'll Be Right Back!</h1>
            <p className='text-gray-600 mb-6'>
              Our server is currently down. Please check back later. We apologize for the inconvenience.
            </p>
            <div className='bg-yellow-100 p-4 rounded-md'>
              <p className='text-yellow-800 font-semibold'>
                Estimated downtime: 30 minutes
              </p>
            </div>
            <button className='mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300'>
              Refresh Page
            </button>
          </div>
        </div>
      )}
      {getState === 1 && (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
          <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
            <img src='./icon.ico' alt='logo' className='mx-auto w-24 h-24 mb-6' />
            <h1 className='text-3xl font-bold text-red-600 mb-4'>Device Not Registered</h1>
            <p className='text-gray-600 mb-6'>
              Please wait for the IT Staff. We apologize for the inconvenience.
            </p>
            {deviceId && <div className='bg-gray-100 p-4 rounded-md'>
              <p className='text-sm text-gray-500 mb-1'>Device ID:</p>
              <p className='text-lg font-mono font-semibold'>{deviceId}</p>
            </div>}
            <div className='bg-gray-100 p-4 rounded-md mt-4'>
              <p className='text-sm text-gray-500 mb-1'>MAC Address:</p>
              <p className='text-lg font-mono font-semibold'>{macAddress}</p>
            </div>
            <button className='mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300'>
              Contact IT Support
            </button>
          </div>
        </div>
      )}
      {getState === 3 && (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
          <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
            <img src='./icon.ico' alt='logo' className='mx-auto w-24 h-24 mb-6' />
            <h1 className='text-3xl font-bold text-red-600 mb-4'>Something Went Wrong</h1>
            <p className='text-gray-600 mb-6'>
              Please wait for the IT Staff. We apologize for the inconvenience and will resolve this issue as soon as possible.
            </p>
            <div className='bg-gray-100 p-4 rounded-md'>
              <p className='text-sm text-gray-500 mb-1'>Device ID:</p>
              <p className='text-lg font-mono font-semibold'>{deviceId}</p>
            </div>
            <button className='mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300'>
              Try Again
            </button>
          </div>
        </div>
      )}
      {getState === 2 &&
        <ScanPage deviceId={deviceId} />
      }
    </div>
  )
}

export default App;
