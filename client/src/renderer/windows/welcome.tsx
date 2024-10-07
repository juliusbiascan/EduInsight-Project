import '../styles/globals.css';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { DeviceUser } from '@prisma/client';
import { Sparkles, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

function Welcome() {
  const [user, setUser] = useState<DeviceUser>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const userId = await api.store.get('userId') as string;
      setUserId(userId);
    }
    fetch();
    // const fetchUserData = async () => {
    //   try {
    //     const userId = await api.store.get('userId') as string;
    //     const users = await api.database.getDeviceUserByActiveUserId(userId);
    //     if (users && users.length > 0) {
    //       setUser(users[0]);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user data:", error);
    //   }
    // };
    // fetchUserData();
  }, []);

  // if (!user) {
  //   return (
  //     <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-lg p-6 w-[500px] h-[100px] flex items-center justify-center">
  //       <p className="text-white text-xl">Loading...</p>
  //     </div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-lg p-6 w-[500px] h-[100px] flex items-center justify-start overflow-hidden transition-all duration-500 ease-in-out"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
        className="w-20 h-20 rounded-full overflow-hidden mr-6 border-4 border-white shadow-md"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={`${user.firstName}'s photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
            {user.firstName?.[0]}
          </div>
        )}
        {userId}
      </motion.div>
      <div className="text-white">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold mb-1 flex items-center"
        >
          Welcome, {user.firstName}! <Sparkles className="ml-2 h-5 w-5 text-yellow-300" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm opacity-90 flex items-center"
        >
          You've successfully logged in. Have a great day! <Waves className="ml-2 h-4 w-4" />
        </motion.p>
      </div>
    </motion.div>
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