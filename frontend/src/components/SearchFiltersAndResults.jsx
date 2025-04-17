/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const SearchFiltersAndResults = ({
  searchQuery,
  searchResults,
  loading,
  selectedCategory,
  selectedColor,
  selectedSize,
  handleColorSelect,
  handleSizeSelect,
  handleCategorySelect,
  handleResultClick,
  goToSearchResults
}) => {
  // State for collapsible sections
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  // Categories for filtering results
  const categories = [
    { id: "all", name: "All" },
    { id: "dresses", name: "Dresses" },
    { id: "tops", name: "Tops" },
    { id: "bottoms", name: "Bottoms" },
    { id: "accessories", name: "Accessories" },
    { id: "outerwear", name: "Outerwear" },
    { id: "shoes", name: "Shoes" }
  ];

  // Enhanced color options with more luxurious colors
  const colorOptions = [
    { id: "white", color: "#FFFFFF", border: true, name: "White" },
    { id: "black", color: "#000000", name: "Black" },
    { id: "beige", color: "#F5F5DC", border: true, name: "Beige" },
    { id: "ivory", color: "#FFFFF0", border: true, name: "Ivory" },
    { id: "cream", color: "#FFFDD0", border: true, name: "Cream" },
    { id: "navy", color: "#000080", name: "Navy" },
    { id: "burgundy", color: "#800020", name: "Burgundy" },
    { id: "emerald", color: "#50C878", name: "Emerald" },
    { id: "gold", color: "#FFD700", name: "Gold" },
    { id: "silver", color: "#C0C0C0", border: true, name: "Silver" },
    { id: "charcoal", color: "#36454F", name: "Charcoal" },
    { id: "red", color: "#FF0000", name: "Red" },
    { id: "blue", color: "#0000FF", name: "Blue" },
    { id: "green", color: "#008000", name: "Green" },
    { id: "yellow", color: "#FFFF00", name: "Yellow" },
    { id: "pink", color: "#FFC0CB", name: "Pink" },
    { id: "purple", color: "#800080", name: "Purple" },
    { id: "camel", color: "#C19A6B", name: "Camel" }
  ];

  // Size options
  const sizeOptions = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

  // Animation variants for collapsible sections
  const contentVariants = {
    open: { 
      height: "auto", 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar with border and subtle shadow */}
      <div className="w-full bg-white border-t border-gray-200 shadow-sm mt-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-gray-800">Filter Results</h2>
            <p className="text-sm text-gray-500">
              Searching for "{searchQuery}"
            </p>
          </div>
          {searchResults.length > 0 && (
            <button 
              onClick={goToSearchResults}
              className="text-sm text-gray-600 hover:text-black px-4 py-2 border border-gray-200 hover:border-gray-400 rounded"
            >
              See all results
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="mx-auto px-6 md:px-16 lg:px-24 max-w-screen-2xl py-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters column */}
            <div className="w-full md:w-64 p-6 bg-white border border-gray-200">
          {/* Color filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => setIsColorOpen(!isColorOpen)}
            >
              <h3 className="font-medium text-sm text-gray-800 tracking-wider">COLOUR</h3>
              {isColorOpen ? 
                <FaChevronUp className="text-gray-500" /> : 
                <FaChevronDown className="text-gray-500" />
              }
            </div>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            
            <AnimatePresence>
              {isColorOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={contentVariants}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <div key={color.id} className="flex flex-col items-center">
                        <button
                          onClick={() => handleColorSelect(color.id)}
                          className={`w-8 h-8 rounded-full ${
                            color.border ? 'border border-gray-300' : ''
                          } ${
                            selectedColor === color.id ? 'ring-2 ring-black ring-offset-1' : ''
                          } hover:opacity-90 transition-opacity duration-200`}
                          style={{ backgroundColor: color.color }}
                          aria-label={`Select ${color.id} color`}
                        />
                        <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Size filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => setIsSizeOpen(!isSizeOpen)}
            >
              <h3 className="font-medium text-sm text-gray-800 tracking-wider">SIZE</h3>
              {isSizeOpen ? 
                <FaChevronUp className="text-gray-500" /> : 
                <FaChevronDown className="text-gray-500" />
              }
            </div>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            
            <AnimatePresence>
              {isSizeOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={contentVariants}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`h-10 flex items-center justify-center border hover:shadow-sm transition-all duration-200 ${
                          selectedSize === size 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-300 hover:border-gray-500 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <h3 className="font-medium text-sm text-gray-800 tracking-wider">CATEGORY</h3>
              {isCategoryOpen ? 
                <FaChevronUp className="text-gray-500" /> : 
                <FaChevronDown className="text-gray-500" />
              }
            </div>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={contentVariants}
                  className="overflow-hidden"
                >
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <button
                          onClick={() => handleCategorySelect(category.id)}
                          className={`text-gray-700 hover:text-black transition-colors duration-200 ${
                            selectedCategory === category.id 
                            ? 'font-medium text-black' 
                            : ''
                          }`}
                        >
                          <span className={selectedCategory === category.id ? 'border-b-2 border-black pb-px' : 'hover:border-b-2 hover:border-gray-300 pb-px'}>
                            {category.name}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results column with elegant fade-in animation */}
        <div className="w-full md:flex-1 p-6 bg-white border border-gray-200">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
            <h3 className="font-medium text-sm text-gray-800 tracking-wider">PRODUCT RESULTS</h3>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-7 w-7 border-2 border-t-black border-r-black border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">
                Searching for exquisite items...
              </p>
            </div>
          )}

          {!loading && searchResults.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-700 text-lg">
                No results found for {searchQuery}
              </p>
              <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
                We couldn't find any products matching your search. Try adjusting your filters or browse our curated collections.
              </p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {searchResults.map(product => (
                <div 
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => handleResultClick(product.id)}
                >
                  {/* Product Image with hover effect */}
                  <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-3 relative">
                    <img
                      src={product.image || product.images?.[0] || "/images/placeholder.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {/* Quick view overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-white bg-opacity-90 px-4 py-2 text-xs uppercase tracking-wider">
                        Quick View
                      </span>
                    </div>
                  </div>
                  
                  {/* Product Info with elegant typography */}
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-800 group-hover:text-black transition-colors duration-200">{product.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 font-medium">₦{parseFloat(product.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersAndResults;