import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/renderer/components/quiz/teacher/sidebar';
import { Header } from '@/renderer/components/quiz/teacher/header';

const QuizLayout: React.FC = () => {
  return (
    <Outlet />
  );
};

export default QuizLayout;
