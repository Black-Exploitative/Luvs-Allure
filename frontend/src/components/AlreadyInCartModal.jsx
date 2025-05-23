import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const AlreadyInCartModal = () => {
  const navigate = useNavigate();
  const { isAlreadyInCartModalOpen, setIsAlreadyInCartModalOpen } = useCart();

  // If modal is not open, don't render anything
  if (!isAlreadyInCartModalOpen) return null;

  const handleProceedToCheckout = () => {
    setIsAlreadyInCartModalOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isAlreadyInCartModalOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsAlreadyInCartModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded shadow-lg max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Item Already In Cart</h2>
              <button
                onClick={() => setIsAlreadyInCartModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img src="/icons/close-menu.svg" alt="Close" className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              This item is already in your shopping bag. Would you like to proceed to checkout?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </button>
              <button 
                onClick={() => setIsAlreadyInCartModalOpen(false)}
                className="w-full bg-white text-black border border-black py-3 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlreadyInCartModal;