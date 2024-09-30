import '../styles/globals.css';
import ReactDOM from 'react-dom/client';
import logo from '../assets/smnhs_logo.png';

function Index() {


  return (
    <div className="container mx-auto flex flex-col">
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
          <img src={logo} alt='logo' className='mx-auto w-24 h-24 mb-6' />
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