"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"

interface OverviewProps {
  data: any[];
};

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-dark">Recent Users Overview</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px' }}
            cursor={{ fill: 'rgba(var(--tooltip-cursor-rgb), 0.1)' }}
          />
          <Bar
            dataKey="total"
            fill="var(--bar-fill)"
            radius={[8, 8, 0, 0]}
            className="fill-primary dark:fill-primary-dark"
          >
            {data.map((entry, index) => (
              <motion.rect key={`bar-${index}`} whileHover={{ scale: 1.1 }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}