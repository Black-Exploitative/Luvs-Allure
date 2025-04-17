/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaTimes, FaHistory } from "react-icons/fa";
import searchService from "../services/searchApi";
import SearchFiltersAndResults from "./SearchFiltersAndResults";

const SearchBar = ({ darkNavbar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300); // Small delay to ensure animation has started

      // Load recent searches from localStorage
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        try {
          setRecentSearches(JSON.parse(savedSearches));
        } catch (error) {
          console.error("Error parsing recent searches:", error);
          setRecentSearches([]);
        }
      }
    }
  }, [isOpen]);

  // Search functionality with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
        fetchSuggestions();
        setShowSuggestions(true);
        setShowFilters(true); // Show filters when search is performed
      } else {
        setSearchResults([]);
        setSuggestions([]);
        setShowSuggestions(false);
        setShowFilters(false); // Hide filters when search is cleared
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedColor, selectedSize, selectedCategory]);

  // Fetch search suggestions
  const fetchSuggestions = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    try {
      const suggestions = await searchService.getSearchSuggestions(searchQuery);
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Call the search service with filters
      const { products } = await searchService.searchProducts(searchQuery, {
        limit: 8,
        color: selectedColor,
        size: selectedSize,
        category: selectedCategory !== "all" ? selectedCategory : undefined
      });

      setSearchResults(products);

      // Save search query to recent searches
      if (searchQuery.trim().length >= 3) {
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Add to recent searches, avoiding duplicates
    const updatedRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
      ),
    ].slice(0, 5); // Keep only the 5 most recent

    setRecentSearches(updatedRecentSearches);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedRecentSearches)
    );
  };

  const handleOpenSearch = () => {
    setIsOpen(true);
  };

  const handleCloseSearch = () => {
    setIsOpen(false);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedCategory("all");
    setShowFilters(false);
  };

  const handleResultClick = (productId) => {
    setIsOpen(false);
    
    // Save search before navigating
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }

    navigate(`/product/${productId}`);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  const handleRecentSearchClick = (searchTerm) => {
    setSearchQuery(searchTerm);
    performSearch();
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowFilters(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId === selectedColor ? null : colorId);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size === selectedSize ? null : size);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Navigate to category page
    navigate(`/category/${categoryId}`);
    handleCloseSearch();
  };

  const goToSearchResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
    handleCloseSearch();
  };

  return (
    <div ref={searchRef} className="relative z-40">
      {/* Search icon button */}
      <button
        onClick={isOpen ? handleCloseSearch : handleOpenSearch}
        className="focus:outline-none transition-opacity duration-300"
        aria-label="Search"
      >
        <motion.img 
          src={darkNavbar ? "/icons/search.svg" : "/icons/search-black.svg"} 
          alt="Search" 
          className="w-5 h-5 cursor-pointer" 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
      </button>

      {/* Search dropdown - upper part (search input) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-[60px] w-full bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 z-50"
          >
            <div className="max-w-screen-xl mx-auto">
              {/* Search input */}
              <div className="flex items-center border-b border-gray-200 py-4 px-4">
                <FaSearch className="text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH..."
                  className="flex-grow text-base uppercase font-light focus:outline-none text-gray-700"
                  autoComplete="off"
                />
                <button 
                  onClick={searchQuery ? handleClearSearch : handleCloseSearch}
                  className="text-gray-500 hover:text-black transition-colors duration-300"
                  aria-label={searchQuery ? "Clear search" : "Close search"}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Recent searches - shown when no query */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="max-w-screen-xl mx-auto p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs text-gray-500">RECENT SEARCHES</h4>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-black"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
                  {recentSearches.map((search, index) => (
                    <div 
                      key={index}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center rounded-full"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <FaHistory className="text-gray-400 mr-2 text-xs" />
                      <span className="text-sm text-gray-600">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="max-w-screen-xl mx-auto p-4">
                <h4 className="text-xs text-gray-500 mb-2">SUGGESTIONS</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center rounded-full"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <FaSearch className="text-gray-400 mr-2 text-xs" />
                      <span className="text-sm text-gray-600">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Results - separate bottom part with clear gap */}
      <AnimatePresence>
        {isOpen && showFilters && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4 }}
            className="fixed left-0 bottom-0 w-full bg-white"
            style={{ 
              height: 'calc(100vh - 180px)', 
              top: 'auto',
              marginTop: '40px'
            }}
          >
            <SearchFiltersAndResults 
              searchQuery={searchQuery}
              searchResults={searchResults}
              loading={loading}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              handleColorSelect={handleColorSelect}
              handleSizeSelect={handleSizeSelect}
              handleCategorySelect={handleCategorySelect}
              handleResultClick={handleResultClick}
              goToSearchResults={goToSearchResults}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;