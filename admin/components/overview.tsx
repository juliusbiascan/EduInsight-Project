"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface OverviewProps {
  data: any[];
};

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 rounded-lg shadow-md"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4a5568" : "#e2e8f0"} />
          <XAxis
            dataKey="name"
            stroke={isDarkMode ? "#a0aec0" : "#4a5568"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={isDarkMode ? "#a0aec0" : "#4a5568"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ 
              background: isDarkMode ? '#2d3748' : '#ffffff', 
              border: `2px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`, 
              borderRadius: '12px', 
              padding: '8px',
              color: isDarkMode ? '#e2e8f0' : '#2d3748'
            }}
            cursor={{ fill: isDarkMode ? 'rgba(74, 85, 104, 0.2)' : 'rgba(226, 232, 240, 0.2)' }}
          />
          <Bar
            dataKey="total"
            fill="url(#colorGradient)"
            radius={[20, 20, 0, 0]}
          >
            {data.map((entry, index) => (
              <motion.rect
                key={`bar-${index}`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDarkMode ? "#4299e1" : "#3182ce"} stopOpacity={0.8} />
              <stop offset="95%" stopColor={isDarkMode ? "#9f7aea" : "#805ad5"} stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}