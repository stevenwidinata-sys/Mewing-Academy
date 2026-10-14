import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { HowAiPage } from './pages/HowAiPage';
import { LessonsPage } from './pages/LessonsPage';
import { MemoryPage } from './pages/MemoryPage';
import { ProgressPage } from './pages/ProgressPage';
import { QuizPage } from './pages/QuizPage';
import { SettingsPage } from './pages/SettingsPage';
import { TutorPage } from './pages/TutorPage';

// Hash router keeps deep links working on static hosting with no server config.
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'lessons', element: <LessonsPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'memory', element: <MemoryPage /> },
      { path: 'tutor', element: <TutorPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'how-ai', element: <HowAiPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
