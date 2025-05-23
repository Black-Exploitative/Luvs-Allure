// frontend/src/components/MiniCartPreview.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MiniCartPreview = () => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { cartItems, getCartTotals, removeFromCart, setIsCartDrawerOpen } = useCart();
  const previewRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Show only the most recent 3 items
  const displayItems = cartItems.slice(0, 3);
  const { subtotal, itemCount } = getCartTotals();
  const hasMoreItems = cartItems.length > 3;

  // Handle mouse enter with delay to prevent flickering
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovering(true);
  };

  // Handle mouse leave with delay to improve UX
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 300);
  };

  // Handle click to open full cart drawer
  const handleCartIconClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCartDrawerOpen(true);
  };

  // Close preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    // Make sure amount is a number and properly formatted
    const numericAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/,/g, '')) 
      : parseFloat(amount);
    
    if (isNaN(numericAmount)) return '₦0.00';
    
    // Format with commas for thousands
    return `₦${numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Don't show preview if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="relative cursor-pointer" onClick={handleCartIconClick}>
        <div className="cart-icon-container">
          {/* We're not using the cart badge here as it's handled by the parent component */}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative z-30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCartIconClick}
      ref={previewRef}
    >
      {/* Mini Cart Preview Popup */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
          >
            <div className="p-4">
              <h3 className="text-sm font-medium uppercase md:tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr :tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr  lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr 2 lg:tracking-wide xl:tracking-wider 2xl:tracking-widerst mb-3 pb-2 border-b border-gray-100">
                My Shopping Bag ({itemCount} item{itemCount !== 1 ? 's' : ''})
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex items-center py-2">
                    <div className="w-14 h-18 bg-gray-50 mr-3 flex-shrink-0">
                      <img 
                        src={item.images?.[0] || item.image || "/images/placeholder.jpg"} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium uppercase truncate">{item.name}</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.selectedSize && <span className="mr-2">Size: {item.selectedSize}</span>}
                        {item.quantity && <span>Qty: {item.quantity}</span>}
                      </div>
                      <p className="text-xs font-medium mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {hasMoreItems && (
                  <div className="text-xs text-gray-500 italic text-center pt-1">
                    + {cartItems.length - 3} more item(s) in bag
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs uppercase font-medium">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {/* Buttons */}
              <div className="mt-4 space-y-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHovering(false);
                    navigate('/checkout');
                  }}
                  className="w-full cursor-pointer bg-black text-white text-xs uppercase md:tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr :tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr  lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr 2 lg:tracking-wide xl:tracking-wider 2xl:tracking-widerst py-2 hover:bg-gray-900 transition-colors"
                >
                  Checkout
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHovering(false);
                    navigate('/shopping-bag');
                  }}
                  className="w-full cursor-pointer bg-white text-black border border-black text-xs uppercase md:tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr :tracking-wide lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr  lg:tracking-wide xl:tracking-wider 2xl:tracking-widerr 2 lg:tracking-wide xl:tracking-wider 2xl:tracking-widerst py-2 hover:bg-gray-50 transition-colors"
                >
                  View Bag
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MiniCartPreview;