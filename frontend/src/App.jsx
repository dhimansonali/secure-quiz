import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from './hooks/useQuiz.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import Quiz from './components/Quiz';
import Results from './pages/Results';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { Brain, Sparkles } from 'lucide-react';

function TestComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Secure Quiz</h1>
        <p className="text-white/60">Application is working!</p>
      </div>
    </div>
  );
}

function QuizLayout() {
  const {
    currentQuestion,
    question,
    questions,
    isCompleted,
    result,
    isLoading,
    progress,
    userEmail,
    userName,
    setUserEmail,
    setUserName,
    handleAnswer,
    resetQuiz,
    ARCHETYPES
  } = useQuiz();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <Routes>
        <Route path="/admin/login" element={<TestComponent />} />
        <Route path="/admin" element={<TestComponent />} />
        <Route path="*" element={
          <AnimatePresence mode="wait">
            <motion.div
              key={isCompleted ? 'results' : 'quiz'}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="w-full"
            >
              {/* Header */}
              <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 p-6 text-center"
              >
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <Brain className="w-8 h-8 text-blue-400" />
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  Personality Archetype Quiz
                </h1>
                <p className="text-white/60 max-w-md mx-auto">
                  Discover your unique personality type through our scientifically-designed assessment
                </p>
                <div className="mt-4">
                  <a href="/admin/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    Admin Access
                  </a>
                </div>
              </motion.header>

              {/* Main Content */}
              <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
                {isCompleted ? (
                  <Results 
                    result={result}
                    userName={userName}
                    userEmail={userEmail}
                    onReset={resetQuiz}
                  />
                ) : (
                  <Quiz
                    question={question}
                    currentQuestion={currentQuestion}
                    totalQuestions={questions.length}
                    progress={progress}
                    onAnswer={handleAnswer}
                    isLoading={isLoading}
                    userEmail={userEmail}
                    userName={userName}
                    setUserEmail={setUserEmail}
                    setUserName={setUserName}
                  />
                )}
              </main>

              {/* Footer */}
              <motion.footer 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 p-6 text-center text-white/40 text-sm"
              >
                <p>© 2024 Secure Quiz. All rights reserved.</p>
                <p className="mt-1">Powered by advanced personality assessment algorithms</p>
              </motion.footer>
            </motion.div>
          </AnimatePresence>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<QuizLayout />} />
        <Route path="/admin/*" element={<Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<Admin />} />
        </Routes>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
