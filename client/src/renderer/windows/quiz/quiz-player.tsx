import { useState, useEffect } from "react";
import "../../styles/globals.css";
import ReactDOM from "react-dom/client";
import { DeviceUser, DeviceUserRole, Quiz, QuizQuestion } from "@prisma/client";
import { WindowIdentifier } from "@/shared/constants";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

function QuizPlayer() {
  const [quiz, setQuiz] = useState<Quiz & { questions: Array<QuizQuestion> } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizId, setQuizId] = useState('');
  const [user, setUser] = useState<DeviceUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    api.quiz.getQuizId((event: any, quizId: string) => {
      setQuizId(quizId);
      fetchQuiz(quizId);
    });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const devices = await api.database.getDevice();
        if (devices && devices.length > 0) {
          const activeUsers = await api.database.getActiveUserByDeviceId(devices[0].id, devices[0].labId);
          if (activeUsers && activeUsers.length > 0) {
            const users = await api.database.getDeviceUserByActiveUserId(activeUsers[0].userId);
            if (users && users.length > 0) {
              setUser(users[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchQuiz = async (quizId: string) => {
    try {
      const fetchedQuiz = await api.database.getQuizById(quizId);
      if (fetchedQuiz && fetchedQuiz.length > 0) {
        setQuiz(fetchedQuiz[0]);
        setTimeLeft(fetchedQuiz[0].questions[0].time);
        // Calculate total points
        const total = fetchedQuiz[0].questions.reduce((sum, question) => sum + (question.points || 0), 0);
        setTotalPoints(total);
      } else {
        throw new Error("Quiz not found");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  useEffect(() => {
    if (!quiz || timeLeft <= 0 || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeUp();
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft, quizCompleted]);

  const handleTimeUp = () => {
    updateScore(false); // No points awarded when time is up

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(quiz.questions[currentQuestionIndex + 1].time);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      if (user && user.role === DeviceUserRole.STUDENT) {
        saveQuizRecord();
      }
    }
  };

  const updateScore = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + (quiz.questions[currentQuestionIndex].points || 0));
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const options = JSON.parse(currentQuestion.options as string) as Array<{ text: string; isCorrect: boolean }>;
    const selectedOption = options.find((option) => option.text === answer);

    setSelectedAnswer(answer);

    updateScore(selectedOption?.isCorrect || false);

    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setTimeLeft(quiz.questions[currentQuestionIndex + 1].time);
        setSelectedAnswer(null);
      } else {
        setQuizCompleted(true);
        if (user && user.role === DeviceUserRole.STUDENT) {
          saveQuizRecord();
        }
      }
    }, 1500);
  };

  const saveQuizRecord = async () => {
    if (!quiz || !user) return;

    try {
      await api.database.saveQuizRecord({
        subjectId: quiz.subjectId,
        userId: user.id,
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving quiz record:", error);
    }
  };

  if (!quiz) return <div className="flex items-center justify-center h-screen text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">Loading quiz... {quizId}</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white text-gray-800 p-12 rounded-lg shadow-2xl"
        >
          <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Quiz Completed!</h1>
          <div className="text-7xl font-bold mb-8 text-center">{score} / {totalPoints}</div>
          <p className="text-3xl mb-8 text-center">Great job!</p>
          <button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
            onClick={() => {
              api.window.close(WindowIdentifier.QuizPlayer);
            }}
          >
            Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8"
    >
      <motion.div
        key={currentQuestionIndex}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex-grow flex flex-col justify-center mb-8"
      >
        <div className="bg-white text-gray-800 p-8 rounded-lg shadow-2xl mb-8">
          <h2 className="text-3xl font-semibold mb-6">{currentQuestion.question}</h2>
          <motion.div
            className="w-full bg-gray-200 rounded-full h-4 mb-8"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: currentQuestion.time, ease: "linear" }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full"></div>
          </motion.div>
          <ul className="space-y-4">
            <AnimatePresence>
              {(JSON.parse(currentQuestion.options as string) as Array<{ text: string; isCorrect: boolean }>).map((option, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    className={`p-5 w-full text-left rounded-lg transition-all transform hover:scale-105 ${selectedAnswer === option.text
                      ? option.isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    onClick={() => handleAnswerSelect(option.text)}
                    disabled={selectedAnswer !== null}
                  >
                    {option.text}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>
      <div className="text-xl font-semibold mb-4">Current Score: {score} / {totalPoints}</div>
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
  ReactDOM.createRoot(container).render(<QuizPlayer />);
})();