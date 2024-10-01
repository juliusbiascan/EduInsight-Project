import "../../styles/globals.css";
import ReactDOM from "react-dom/client";
import { Routes, Route, HashRouter } from "react-router-dom";
import QuizLayout from "./routes/quiz-layout";
import QuizLibrary from "./routes/quiz-library";
import CreateQuiz from "./routes/quiz-create";
import QuizManager from "./routes/quiz-manager";
import QuizQuestions from "./routes/quiz-questions";

function Index() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<QuizLayout />}>
        <Route index element={<QuizLibrary />} />
        <Route path="create-quiz" element={<CreateQuiz />} />
        <Route path="quiz-questions" element={<QuizQuestions />} />
        <Route path="quiz-manager" element={<QuizManager />} />
      </Route>
    </Routes>
  </HashRouter>
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