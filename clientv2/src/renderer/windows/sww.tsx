import '../styles/globals.css';
import ReactDOM from 'react-dom/client';
import logo from '../assets/smnhs_logo.png';

function Index() {

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
        <img src={logo} alt='logo' className='mx-auto w-24 h-24 mb-6' />
        <h1 className='text-3xl font-bold text-red-600 mb-4'>Something Went Wrong</h1>
        <p className='text-gray-600 mb-6'>
          Please wait for the IT Staff. We apologize for the inconvenience and will resolve this issue as soon as possible.
        </p>

        <button className='mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300'>
          Try Again
        </button>
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