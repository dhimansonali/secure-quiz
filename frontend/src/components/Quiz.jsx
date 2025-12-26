import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, User, Mail, Loader2 } from 'lucide-react';

export default function Quiz({ 
  question, 
  currentQuestion, 
  totalQuestions, 
  progress, 
  onAnswer, 
  isLoading, 
  userEmail, 
  userName, 
  setUserEmail, 
  setUserName 
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    }),
    hover: { 
      scale: 1.02, 
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      transition: { duration: 0.2 }
    }
  };

  const handleOptionClick = (option) => {
    console.log('Option clicked:', option);
    console.log('Current question:', currentQuestion);
    console.log('User email:', userEmail);
    console.log('User name:', userName);
    
    if (currentQuestion === 0 && (!userEmail || !userName)) {
      console.log('First question - missing user info');
      return;
    }
    console.log('Setting selected option');
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(question.id, selectedOption);
      setSelectedOption(null);
    }
  };

  const canSubmit = selectedOption && (currentQuestion > 0 || (userEmail && userName));
  
  console.log('Selected option:', selectedOption);
  console.log('Can submit:', canSubmit);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto p-6"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Question {currentQuestion + 1} of {totalQuestions}</span>
          <span className="text-white/60 text-sm">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="h-full progress-shine rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* User Info for first question */}
      {currentQuestion === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-blue-400" />
              <label className="text-white/80 text-sm">Your Name</label>
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <label className="text-white/80 text-sm">Email Address</label>
            </div>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Question */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {question.question}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <motion.div
            key={option.value}
            custom={index}
            variants={optionVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOptionClick(option)}
            className={`
              glass rounded-xl p-4 cursor-pointer transition-all duration-300
              ${currentQuestion === 0 && (!userEmail || !userName) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 active:scale-95'
              }
              ${selectedOption?.value === option.value 
                ? 'bg-blue-500/30 border-blue-400/50' 
                : 'hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-lg">{option.text}</span>
              <div className="flex items-center space-x-2">
                {selectedOption?.value === option.value && (
                  <div className="w-4 h-4 bg-blue-400 rounded-full" />
                )}
                <ChevronRight className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          whileHover={{ scale: canSubmit ? 1.02 : 1 }}
          whileTap={{ scale: canSubmit ? 0.98 : 1 }}
          className={`
            px-8 py-3 rounded-xl font-semibold transition-all duration-300
            ${canSubmit 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl' 
              : 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{currentQuestion === totalQuestions - 1 ? 'Complete Quiz' : 'Next Question'}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="glass rounded-xl p-6 flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-white">Calculating your results...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
