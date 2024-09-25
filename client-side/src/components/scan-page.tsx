import React from 'react';
//import { Button } from './ui/button';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

interface ScanPageProps {
  deviceId: string;
}

const ScanPage: React.FC<ScanPageProps> = ({ deviceId }) => {
  return (
    <div className="container mx-auto flex flex-col p-4 md:p-8 lg:p-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="my-auto w-full grid grid-cols-1 gap-8 lg:grid-cols-2 items-center"
      >
        <div className="flex flex-col justify-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 flex items-center justify-center lg:justify-start"
          >
            <img className="h-8" src="./icon.ico" alt="logo" />
            <h4 className="ml-3 text-lg font-bold tracking-widest text-primary">
              San Miguel National Highschool
            </h4>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-6 text-4xl font-extrabold leading-tight text-dark-grey-900 lg:text-5xl xl:text-6xl"
          >
            EDUINSIGHT CLIENT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8 text-lg font-medium leading-7 text-dark-grey-600 xl:w-4/5"
          >
            A Computer Lab Monitoring System for Enhanced Learning
            in San Miguel National Highschool
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg"
        >
          <QRCode className="w-4/5 max-w-[250px] rounded-2xl" value={deviceId} />
          <h2 className="text-2xl font-bold text-center text-dark-grey-900 mt-8 mb-4">
            Scan here!
          </h2>
          <p className="text-lg text-center text-dark-grey-600 mb-6">
            Scan QR code to use this device and take your learning experience to the next level!
          </p>
          {/* <Button className="mt-4 px-8 py-3 text-lg font-semibold">
            Get Started
          </Button> */}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ScanPage;
