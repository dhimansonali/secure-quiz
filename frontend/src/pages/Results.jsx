import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, RotateCcw, Trophy, Target, Zap, Mail, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Results({ result, userName, userEmail, onReset }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(99, 102, 241);
      doc.text('Personality Quiz Results', 105, 30, { align: 'center' });
      
      // User info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${userName}`, 20, 50);
      doc.text(`Email: ${userEmail}`, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
      
      // Archetype
      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      doc.text(`Your Archetype: ${result.archetype}`, 20, 90);
      
      // Confidence
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Confidence: ${result.confidence}%`, 20, 100);
      
      // Description (if available)
      if (result.description) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const splitDescription = doc.splitTextToSize(result.description, 170);
        doc.text(splitDescription, 20, 115);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
      
      // Download
      doc.save(`quiz-results-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareResults = () => {
    const text = `I just discovered I'm a ${result.archetype}! Take the quiz to find your personality archetype.`;
    if (navigator.share) {
      navigator.share({
        title: 'My Personality Quiz Results',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert('Results copied to clipboard!');
    }
  };

  const getArchetypeColor = (archetype) => {
    const colors = {
      'Leader': 'from-blue-500 to-cyan-500',
      'Analyst': 'from-purple-500 to-pink-500',
      'Collaborator': 'from-green-500 to-emerald-500',
      'Visionary': 'from-orange-500 to-yellow-500',
      'Achiever': 'from-red-500 to-pink-500',
      'Scholar': 'from-indigo-500 to-purple-500',
      'Mentor': 'from-teal-500 to-green-500',
      'Creator': 'from-pink-500 to-rose-500'
    };
    return colors[archetype] || 'from-blue-500 to-purple-500';
  };

  const colorGradient = getArchetypeColor(result.archetype);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${colorGradient} mb-4`}>
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          {result.archetype}
        </h1>
        <p className="text-white/60 text-lg">
          Your personality archetype has been revealed!
        </p>
      </motion.div>

      {/* User Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6 flex items-center justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-white">
            <span className="font-semibold">{userName}</span>
          </div>
          <div className="flex items-center space-x-3 text-white/60 text-sm">
            <Mail className="w-4 h-4" />
            <span>{userEmail}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-white">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold">{result.confidence}%</span>
          </div>
          <p className="text-white/60 text-sm">Confidence</p>
        </div>
      </motion.div>

      {/* Main Result Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-8 mb-6"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">About Your Archetype</h2>
        <p className="text-white/80 leading-relaxed text-lg">
          {result.description || 'Your archetype reveals unique personality traits and strengths that define how you interact with the world.'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Quiz Results</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Match Confidence</span>
                <span className="text-white font-semibold">{result.confidence}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
            </div>
            {result.completionTime && (
              <div className="flex items-center justify-between text-white/70">
                <Clock className="w-4 h-4 mr-2 inline" />
                <span>Completed: {result.completionTime}s</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Key Insights</span>
          </h3>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">→</span>
              <span>Your archetype represents your core personality traits</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">→</span>
              <span>Share your results to compare with friends</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-pink-400 mt-1">→</span>
              <span>Download your detailed PDF report</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
          disabled={isDownloading}
          className="glass rounded-xl px-6 py-3 text-white font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareResults}
          className="glass rounded-xl px-6 py-3 text-white font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Results</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="glass rounded-xl px-6 py-3 text-white font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Retake Quiz</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
