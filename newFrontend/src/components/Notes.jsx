import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes, FaMoon, FaSun, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Notes = ({ imageData }) => {
  const [fontSize, setFontSize] = useState(16);
  const [fontName, setFontName] = useState('Arial');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [noteText, setNoteText] = useState('');
  const { date } = useParams();
  console.log(imageData);
  useEffect(() => {
    const allText = imageData.map((content) => content.image_text).join('\n\n');
    const allImage = imageData.map((content) => content.image_url);
    setImageUrls(allImage);
    setNoteText(allText);
  }, [imageData]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{subjectName}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{date}</p>
          </div>
          <div className="space-x-4 flex">
            <button onClick={toggleTheme} className="flex items-center p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">
              {isDarkMode ? <FaSun className="text-yellow-500 text-xl" /> : <FaMoon className="text-gray-800 text-xl" />}
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">
              <FaCog className="text-xl" />
            </button>
            <button onClick={handleSummarize} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 flex items-center" disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Summarize✨'
              )}
            </button>
          </div>
        </header>

        <motion.div
          className="p-6 rounded-lg shadow-lg bg-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`w-full h-[60vh] p-4 rounded border overflow-auto transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontName,
              lineHeight: lineHeight,
              letterSpacing: `${letterSpacing}em`,
            }}
          >
            {noteText}
          </div>
        </motion.div>

        {/* Image Gallery */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {imageUrls.map((url, index) => (
            <motion.img
              key={index}
              src={url}
              alt={`Image ${index + 1}`}
              className="cursor-pointer rounded-lg shadow-lg hover:opacity-75 transition-opacity duration-300"
              onClick={() => handleImageClick(url)}
            />
          ))}
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <motion.img
              src={selectedImage}
              alt="Enlarged"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking the image
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summarizedText && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.5 }} className="mt-8 max-w-4xl mx-auto">
            <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Summary</h2>
                <button onClick={() => setIsSummaryExpanded(!isSummaryExpanded)} className="text-blue-500 hover:text-blue-600">
                  {isSummaryExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              <AnimatePresence>
                {isSummaryExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{summarizedText}</ReactMarkdown>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {references.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
                <h2 className="text-2xl font-bold mb-4">References</h2>
                <ul className="space-y-2">
                  {references.map((ref, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                    >
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-500 dark:text-blue-400"
                      >
                        <ReactMarkdown className="prose dark:prose-invert max-w-none">
                          {ref}
                        </ReactMarkdown>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
