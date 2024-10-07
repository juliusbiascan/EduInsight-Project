import '../styles/globals.css';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { DeviceUser } from '@prisma/client';
import { Sparkles, Waves } from 'lucide-react';

function Welcome() {
  const [user, setUser] = useState<DeviceUser>();

  useEffect(() => {
    const fetch = async () => {
      const userId = await api.store.get('userId') as string;
      const user = await api.database.getDeviceUserById(userId);
      setUser(user);
    }
    fetch();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-lg p-8 w-[600px] h-[200px] flex items-center justify-start overflow-hidden">
      <div className="w-32 h-32 rounded-full overflow-hidden mr-8 border-4 border-white shadow-md flex-shrink-0">
        {user?.image ? (
          <img
            src={user.image}
            alt={`${user.firstName}'s photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-5xl font-bold text-white">
            {user?.firstName?.[0]}
          </div>
        )}
      </div>
      <div className="text-white flex-grow">
        <h1 className="text-4xl font-bold mb-3 flex items-center">
          Welcome, {user?.firstName}! <Sparkles className="ml-3 h-8 w-8 text-yellow-300" />
        </h1>
        <p className="text-xl opacity-90 flex items-center">
          You've successfully logged in. Have a great day! <Waves className="ml-3 h-6 w-6" />
        </p>
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
  ReactDOM.createRoot(container).render(<Welcome />);
})();