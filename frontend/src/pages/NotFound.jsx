/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Text states for fade-in animation
  const [showQuote, setShowQuote] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  
  // Motion values for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Clothing items for animation
  const clothingItems = [
    { icon: "👗", rotate: [-10, 10], scale: 0.9, delay: 0.2 },
    { icon: "👠", rotate: [5, -5], scale: 0.8, delay: 1.2 },
    { icon: "👜", rotate: [-5, 15], scale: 1, delay: 0.5 },
    { icon: "🧥", rotate: [10, -10], scale: 1.1, delay: 0.8 },
    { icon: "👒", rotate: [-15, 5], scale: 0.9, delay: 1.5 },
    { icon: "🧣", rotate: [5, -15], scale: 0.7, delay: 0.3 },
  ];
  
  // Controls for animations
  const buttonControls = useAnimation();
  const lineControls = useAnimation();
  
  // Auto-redirect after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [countdown, navigate]);
  
  // Setup mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Update motion values
      mouseX.set(clientX);
      mouseY.set(clientY);
      
      // Calculate normalized position (-0.5 to 0.5)
      setMousePosition({
        x: (clientX / window.innerWidth) - 0.5,
        y: (clientY / window.innerHeight) - 0.5
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);
  
  // Initialize animations
  useEffect(() => {
    // Sequence the text animations
    setTimeout(() => setShowQuote(true), 300);
    setTimeout(() => setShowDescription(true), 800);
    setTimeout(() => setShowRedirect(true), 1300);
    
    // Button animation
    buttonControls.start({
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    });
    
    // Line animation
    lineControls.start({
      width: ["0%", "100%"],
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    });
  }, [buttonControls, lineControls]);
  
  // Generate dropping clothing items for background
  const generateDroppingClothes = () => {
    return Array(20).fill().map((_, index) => {
      const item = clothingItems[index % clothingItems.length];
      const xPos = Math.random() * 100; // Random horizontal position (0-100%)
      const initialY = -200 - Math.random() * 800; // Start above viewport
      const fallSpeed = Math.random() * 15 + 10; // Random speed between 10-25s
      const rotation = Math.random() * 360; // Random initial rotation
      const opacity = Math.random() * 0.06 + 0.02; // Low opacity between 0.02-0.08
      const size = Math.random() * 0.5 + 0.7; // Random size between 0.7-1.2
      
      return (
        <motion.div
          key={index}
          className="absolute text-3xl md:text-4xl pointer-events-none"
          style={{ 
            left: `${xPos}%`, 
            top: initialY,
            opacity: opacity,
            scale: size,
            rotate: rotation
          }}
          animate={{
            y: window.innerHeight + 200, // Fall beyond bottom of screen
            rotate: rotation + 180, // Rotate as it falls
          }}
          transition={{
            y: { 
              duration: fallSpeed,
              repeat: Infinity,
              ease: "linear"
            },
            rotate: {
              duration: fallSpeed * 1.5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          {item.icon}
        </motion.div>
      );
    });
  };
  
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-gray-800 font-light" ref={containerRef}>
      {/* Navbar */}
      <Navbar />
      
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-0" />
      
      {/* Background pattern - dots */}
      <div 
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Falling clothing items in background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {generateDroppingClothes()}
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-6 z-10 mt-[70px]">
        <div className="max-w-4xl w-full mx-auto text-center py-16 md:py-24">
          {/* Quote */}
          <AnimatePresence>
            {showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-wider text-gray-900 leading-tight">
                  STYLE NEVER GETS LOST
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Animated line */}
          <motion.div 
            className="h-px bg-gray-300 mx-auto mb-12 overflow-hidden"
            animate={lineControls}
            style={{ width: "40%" }}
          />
          
          {/* Suspended clothing items showcase */}
          <div className="relative h-24 md:h-32 mb-12">
            {clothingItems.map((item, index) => {
              // Calculate the x position to distribute items evenly
              const xPos = (index / (clothingItems.length - 1)) * 80 + 10; // 10% to 90%
              
              return (
                <motion.div
                  key={index}
                  className="absolute text-4xl md:text-5xl"
                  style={{ 
                    left: `${xPos}%`,
                    top: "50%",
                    y: "-50%"
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    rotate: item.rotate,
                    scale: [item.scale * 0.9, item.scale * 1.1, item.scale]
                  }}
                  transition={{
                    delay: item.delay,
                    opacity: { duration: 0.8 },
                    y: { duration: 0.5 },
                    rotate: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 4 + index,
                    },
                    scale: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 3 + index * 0.5,
                    }
                  }}
                >
                  {item.icon}
                </motion.div>
              );
            })}
          </div>
          
          {/* Description */}
          <AnimatePresence>
            {showDescription && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
                  While the page you're looking for seems to have gone out of season, 
                  our collection continues.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Button */}
          <AnimatePresence>
            {showRedirect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-10"
              >
                <motion.div
                  animate={buttonControls}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/"
                    className="inline-block px-10 py-3 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm"
                  >
                    Return to Collection
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Countdown */}
          <AnimatePresence>
            {showRedirect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-sm text-gray-400"
              >
                Redirecting in {countdown} seconds
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Collection links */}
          <AnimatePresence>
            {showRedirect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-16 md:mt-24"
              >
                <motion.div 
                  className="h-px w-16 bg-gray-200 mx-auto mb-8"
                  initial={{ width: 0 }}
                  animate={{ width: "4rem" }}
                  transition={{ duration: 0.8 }}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    { name: "NEW ARRIVALS", path: "/collections/new-arrivals", delay: 0.6 },
                    { name: "ESSENTIALS", path: "/collections/essentials", delay: 0.7 },
                    { name: "ACCESSORIES", path: "/collections/accessories", delay: 0.8 },
                    { name: "RUNWAY", path: "/collections/runway", delay: 0.9 },
                  ].map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: link.delay,
                        duration: 0.5
                      }}
                    >
                      <Link 
                        to={link.path}
                        className="block py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <Footer />
      </motion.div>
    </div>
  );
};

export default NotFound;