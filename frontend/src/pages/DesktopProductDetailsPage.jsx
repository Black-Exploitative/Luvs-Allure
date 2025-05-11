/* eslint-disable no-unused-vars */
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import ProductCarousel from "../components/ProductCarousel";
import ExpandableSection from "../components/ExpandableSection";
import SmallProductCard from "../components/SmallProductCard";
import PurchasedCard from "../components/PurchasedCard";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { useRecentlyViewed } from "../context/RecentlyViewedProducts";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import StarRating from "../components/StarRating";
import cmsService from "../services/cmsService";
import CustomersReviews from "../components/CustomersReviews";
import SizeGuideModal from "../components/SizeGuideModal";
import api from "../services/api";
import ColorVariants from "../components/ColorVaraint";
import { useWishlist } from "../context/WishlistContext";

const ProductDetailsPage = () => {
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);

  const reviewsRef = useRef(null);
  // URL and navigation
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const rawProduct = location.state?.product;

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const parseProductSlug = (slug) => {
    if (!slug) return { productId: null, productName: null, colorName: null };

    // Check if the slug follows the pattern product-name---color_productId
    if (slug.includes("---") && slug.includes("_")) {
      const [namePart, idPart] = slug.split("_");
      const [productName, colorName] = namePart.split("---");
      return {
        productId: idPart,
        productName: productName,
        colorName: colorName,
      };
    }

    // Handle the case where it's just product-name_productId
    const parts = slug.split("_");
    if (parts.length > 1) {
      return {
        productId: parts[parts.length - 1],
        productName: parts.slice(0, -1).join("_"),
        colorName: null,
      };
    }

    // Fallback for simple slugs (just the ID)
    return {
      productId: slug,
      productName: null,
      colorName: null,
    };
  };

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User selection state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [colorVariants, setColorVariants] = useState([]);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Replace the existing state
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  // Add this useEffect to initialize wishlist state when product loads
  useEffect(() => {
    if (product && product.id) {
      setIsInWishlistState(isInWishlist(product.id));
    }
  }, [product, isInWishlist]);

  // Display images (changes based on color selection)
  const [displayImages, setDisplayImages] = useState([]);

  // Related products state
  const [styleWithProducts, setStyleWithProducts] = useState([]);
  const [alsoPurchasedProducts, setAlsoPurchasedProducts] = useState([]);
  const [alsoViewedProducts, setAlsoViewedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Hooks
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Extract product ID from the slug
  const productId = useMemo(() => {
    if (!slug) return null;
    // Extract ID from the format "product-name_123456"
    const parts = slug.split("_");
    return parts.length > 1 ? parts[parts.length - 1] : slug;
  }, [slug]);

  // Extract product name from the slug for the page title
  const productName = useMemo(() => {
    if (!slug) return "";
    const parts = slug.split("_");
    if (parts.length > 1) {
      // Remove the last part (the ID) and join the rest
      return parts
        .slice(0, -1)
        .join(" ")
        .split("-")
        .join(" ") // Replace hyphens with spaces
        .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
    }
    return "";
  }, [slug]);

  // Set page title
  useEffect(() => {
    // Set default title
    document.title = "Luv's Allure";

    // Update title when product loads
    if (product?.name) {
      document.title = `${product.name} | Luv's Allure`;
    } else if (productName) {
      document.title = `${productName} | Luv's Allure`;
    }

    // Cleanup when component unmounts
    return () => {
      document.title = "Luv's Allure"; // Reset to default
    };
  }, [product, productName]);

  const renderStyleItWith = () => {
    if (loadingRelated) {
      return (
        <div className="mt-[50px]">
          <h2 className="text-[15px] mb-4 text-center">STYLE IT WITH</h2>
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }

    // Only render if we have style-with products
    if (styleWithProducts && styleWithProducts.length > 0) {
      return (
        <div className="mt-[50px]">
          <h2 className="text-[15px] mb-4 text-center">STYLE IT WITH</h2>
          <div className="grid gap-4 md:gap-6">
            {styleWithProducts.map((product, index) => (
              <SmallProductCard
                key={product.id || index}
                image={
                  product.images?.[0] ||
                  product.image ||
                  "/images/placeholder.jpg"
                }
                name={product.title || product.name}
                color={product.color || "Default"}
                price={`₦${parseFloat(product.price).toLocaleString()}`}
                onViewProduct={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        </div>
      );
    }

    // Don't render anything if no products
    return null;
  };

  // Initialize display images when product loads
  const processAndValidateImages = (imageArray) => {
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      return ["/images/placeholder.jpg"];
    }

    // Ensure all images are valid strings
    return imageArray.map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object") {
        return img.src || img.url || "/images/placeholder.jpg";
      }
      return "/images/placeholder.jpg";
    });
  };

  // Replace your current useEffect for initializing displayImages with this:
  useEffect(() => {
    if (product) {
      console.log(
        "Setting initial display images from product:",
        product.images
      );
      if (product.images && product.images.length > 0) {
        // Process images to ensure they're valid
        const validatedImages = processAndValidateImages(product.images);
        setDisplayImages(validatedImages);

        // Force render by using a timeout
        setTimeout(() => {
          console.log("Re-validating images after delay");
          setDisplayImages([...validatedImages]);
        }, 50);
      } else {
        // Set a default image if no images are available
        setDisplayImages(["/images/placeholder.jpg"]);
      }
    }
  }, [product]);

  // Fetch product data when component mounts or productId changes
  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();

    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Parse the slug to get productId and colorName
        const { productId: parsedProductId, colorName } =
          parseProductSlug(slug);

        if (!parsedProductId) {
          setError("Product ID is missing");
          return;
        }

        console.log("Attempting to fetch product with ID:", parsedProductId);

        try {
          // Log the URL being called
          const apiUrl = `/products/id/${parsedProductId}`;
          console.log("Calling API endpoint:", apiUrl);

          const response = await api.get(apiUrl, {
            signal: controller.signal,
          });

          if (!isMounted) return;

          // Debug the API response
          console.log("API Response:", response);

          if (response.data) {
            console.log("API Response Data:", response.data);

            // Handle different response structures
            let productData = null;

            if (response.data.product) {
              productData = response.data.product;
            } else if (response.data.data && response.data.data.product) {
              // GraphQL style response
              productData = response.data.data.product;
            } else if (
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              // Array response, take first item
              productData = response.data[0];
            } else if (typeof response.data === "object" && response.data.id) {
              // Direct product object
              productData = response.data;
            }

            if (productData) {
              console.log("Found product data:", productData);
              const processedProduct = processApiProduct(productData);

              // If we have a color from the URL, select it
              if (colorName) {
                setSelectedColor(
                  colorName.charAt(0).toUpperCase() + colorName.slice(1)
                );
              }

              setProduct(processedProduct);
              addToRecentlyViewed(processedProduct);
            } else {
              console.error("Could not find product data in API response");
              throw new Error("Product data not found in API response");
            }
          } else {
            console.error("API returned empty response");
            throw new Error("Empty response from API");
          }
        } catch (err) {
          if (!isMounted) return;

          if (err.name === "AbortError") {
            console.log("Fetch aborted");
            return;
          }

          console.error("Error fetching product:", err);

          // Try fallback to location state if available
          if (location.state?.product) {
            console.log(
              "API error, using product data from navigation state as fallback"
            );
            console.log("State product data:", location.state.product);
            const processedProduct = processShopifyProduct(
              location.state.product
            );
            setProduct(processedProduct);
            addToRecentlyViewed(processedProduct);
          } else {
            setError(`Failed to load product: ${err.message}`);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProductData();

    // Cleanup function to abort fetch and prevent state updates after unmount
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);

  // Fetch all color variants when the product loads
  useEffect(() => {
    if (!product || !productId) return;

    // Function to fetch products with the same model tag
    const fetchColorVariants = async () => {
      try {
        // Extract base model name from product name (simplified approach)
        // If product name doesn't contain a dash, use the whole name
        let baseModelName;
        if (product.name.includes(" - ")) {
          baseModelName = product.name
            .split(" - ")[0]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
        } else {
          baseModelName = product.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
        }

        // Create tag for model search
        const modelTag = `model-${baseModelName}`;
        console.log(`Searching for color variants with tag: ${modelTag}`);

        // Use the correct endpoint for tag-based search
        const response = await api.get(`/search/tag?tag=${modelTag}`);

        if (response.data && response.data.products) {
          console.log(
            `Found ${response.data.products.length} potential color variants`
          );

          // Include the current product in the color variants
          const currentProductIncluded = response.data.products.some(
            (variant) => variant.id === productId
          );

          // If current product is not included in the search results, add it
          let variants = [...response.data.products];
          if (!currentProductIncluded) {
            console.log(
              `Current product not found in results, adding it manually`
            );
            variants = [
              {
                id: productId,
                title: product.name,
                handle: "", // We don't need the handle for current product
                image: product.images[0],
                price: product.price,
              },
              ...variants,
            ];
          }

          // Process variants to extract color information
          const processedVariants = variants.map((variant) => {
            // Extract color from name or title (assuming format: "Product Name - Color")
            let variantColor = "";
            if (variant.name && variant.name.includes(" - ")) {
              variantColor = variant.name.split(" - ")[1].trim();
            } else if (variant.title && variant.title.includes(" - ")) {
              variantColor = variant.title.split(" - ")[1].trim();
            } else {
              // Default color if not specified
              variantColor = variant.id === productId ? "Default" : "Variant";
              console.log(
                `No color found in name/title for variant ${variant.id}, using ${variantColor}`
              );
            }

            return {
              id: variant.id,
              name: variant.name || variant.title,
              color: variantColor,
              handle: variant.handle,
              image:
                variant.images?.[0] ||
                variant.image ||
                "/images/placeholder.jpg",
              price: variant.price,
            };
          });

          // Update the product's colors with all color variants
          const uniqueColors = [];
          const colorNames = new Set();

          processedVariants.forEach((variant) => {
            if (!colorNames.has(variant.color)) {
              colorNames.add(variant.color);
              uniqueColors.push({
                name: variant.color,
                code: getColorCode(variant.color),
                inStock: true,
                variantId: variant.id,
                variantHandle: variant.handle,
                variantImage: variant.image,
              });
            }
          });

          console.log(
            `Found ${uniqueColors.length} unique color variants:`,
            uniqueColors.map((c) => c.name).join(", ")
          );

          // Replace product's colors with all available colors if we found variants
          if (uniqueColors.length > 0) {
            setProduct((prevProduct) => ({
              ...prevProduct,
              colors: uniqueColors,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching color variants:", error);
      }
    };

    fetchColorVariants();
  }, [product?.name, productId]);
  // When a color is selected, either update the display images or navigate to the variant

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      try {
        setLoadingRelated(true);

        // Fetch each type of related product
        const styleWith = await cmsService.getProductRelationships(
          productId,
          "style-with"
        );
        const alsoPurchased = await cmsService.getProductRelationships(
          productId,
          "also-purchased"
        );
        const alsoViewed = await cmsService.getProductRelationships(
          productId,
          "also-viewed"
        );

        // Update state with fetched products
        setStyleWithProducts(styleWith || []);
        setAlsoPurchasedProducts(alsoPurchased || []);
        setAlsoViewedProducts(alsoViewed || []);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  // Function to get images for a specific color
  const getImagesForColor = (colorName) => {
    if (!product || !colorName) return product?.images || [];

    console.log(`Getting images for color: ${colorName}`);

    // Check if the product has variants with images by color
    if (product.variants && Array.isArray(product.variants)) {
      console.log("Checking variants for color-specific images");

      // Find variant(s) matching this color
      const colorVariants = product.variants.filter((variant) => {
        // Check direct color property
        if (variant.color === colorName) {
          return true;
        }

        // Check selectedOptions array
        if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
          return variant.selectedOptions.some(
            (opt) =>
              opt.name &&
              opt.name.toLowerCase() === "color" &&
              opt.value === colorName
          );
        }

        // Check options property
        if (variant.options && Array.isArray(variant.options)) {
          return variant.options.some(
            (opt) =>
              opt.name &&
              opt.name.toLowerCase() === "color" &&
              opt.value === colorName
          );
        }

        return false;
      });

      console.log(
        `Found ${colorVariants.length} variants matching color: ${colorName}`
      );

      // If we found variants with this color and they have images, use those
      if (colorVariants.length > 0) {
        // First check for direct images on the variant
        const variantImagesArrays = colorVariants
          .map((variant) => variant.images)
          .filter(Array.isArray);

        if (variantImagesArrays.length > 0) {
          const flattenedImages = variantImagesArrays.flat();
          console.log(
            `Found ${flattenedImages.length} images from variant.images arrays`
          );

          if (flattenedImages.length > 0) {
            return flattenedImages;
          }
        }

        // Then check for single image property
        const variantSingleImages = colorVariants
          .map((variant) => variant.image)
          .filter(Boolean);

        if (variantSingleImages.length > 0) {
          console.log(
            `Found ${variantSingleImages.length} images from variant.image properties`
          );

          const processedImages = variantSingleImages.map((image) =>
            typeof image === "string" ? image : image.src || image.url || image
          );

          if (processedImages.length > 0) {
            return processedImages;
          }
        }
      }
    }

    // Check if there are color-specific images in the product object
    if (product.colorImages && product.colorImages[colorName]) {
      console.log(
        `Found direct color images for ${colorName} in product.colorImages`
      );
      return product.colorImages[colorName];
    }

    // Fallback to the main product images if no color-specific images found
    console.log("No color-specific images found, using main product images");
    return product.images || [];
  };

  // Update display images when color is selected
  useEffect(() => {
    if (selectedColor && product) {
      // Get images for the selected color
      const colorImages = getImagesForColor(selectedColor);

      // Update display images to show the selected color
      setDisplayImages(colorImages.length > 0 ? colorImages : product.images);
    }
  }, [selectedColor, product]);

  // Process API product data to match component needs
  const processApiProduct = (apiProduct) => {
    if (!apiProduct) return null;

    // Debug the incoming data structure to understand what we're working with
    console.log("API Product Raw Data:", JSON.stringify(apiProduct, null, 2));

    // Extract product details from API response
    let productImages = [];
    let productSizes = [];
    let productColors = [];
    let productVariants = [];

    // ENHANCED: More flexible image processing
    if (apiProduct.images) {
      // Direct array format
      if (Array.isArray(apiProduct.images)) {
        productImages = apiProduct.images.map((img) =>
          typeof img === "string" ? img : img.src || img.url || img
        );
      }
      // Edges format from GraphQL APIs
      else if (apiProduct.images.edges) {
        productImages = apiProduct.images.edges.map(
          (edge) =>
            edge.node.url || edge.node.src || edge.node.originalSrc || edge.node
        );
      }
      // Object with array property
      else if (apiProduct.images.items || apiProduct.images.data) {
        const imagesArray = apiProduct.images.items || apiProduct.images.data;
        productImages = imagesArray.map((img) =>
          typeof img === "string" ? img : img.src || img.url || img
        );
      }
      // Single image object
      else if (typeof apiProduct.images === "object") {
        const img = apiProduct.images;
        productImages = [img.src || img.url || img.originalSrc || ""];
      }
    }

    // Check for image in other common locations
    if (productImages.length === 0 && apiProduct.image) {
      if (typeof apiProduct.image === "string") {
        productImages = [apiProduct.image];
      } else if (apiProduct.image.src || apiProduct.image.url) {
        productImages = [apiProduct.image.src || apiProduct.image.url];
      }
    }

    console.log("Extracted Images:", productImages);

    // ENHANCED: More flexible variant processing
    if (apiProduct.variants) {
      // Process variants array
      if (Array.isArray(apiProduct.variants)) {
        productVariants = apiProduct.variants;

        // Extract sizes from variants
        const sizeValues = apiProduct.variants
          .map(
            (v) =>
              v.size ||
              (v.options && v.options.find((o) => o.name === "Size")?.value)
          )
          .filter(Boolean);
        productSizes = [...new Set(sizeValues)];

        // Extract colors from variants
        const colorValues = apiProduct.variants
          .map(
            (v) =>
              v.color ||
              (v.options && v.options.find((o) => o.name === "Color")?.value)
          )
          .filter(Boolean);
        productColors = [...new Set(colorValues)].map((colorName) => ({
          name: colorName,
          code: getColorCode(colorName),
          inStock: true,
        }));
      }
      // Handle GraphQL edges format
      else if (apiProduct.variants.edges) {
        productVariants = apiProduct.variants.edges.map((edge) => edge.node);

        // Extract sizes and colors from edge nodes
        const sizeValues = productVariants
          .map(
            (v) =>
              v.size ||
              (v.options && v.options.find((o) => o.name === "Size")?.value)
          )
          .filter(Boolean);
        productSizes = [...new Set(sizeValues)];

        const colorValues = productVariants
          .map(
            (v) =>
              v.color ||
              (v.options && v.options.find((o) => o.name === "Color")?.value)
          )
          .filter(Boolean);
        productColors = [...new Set(colorValues)].map((colorName) => ({
          name: colorName,
          code: getColorCode(colorName),
          inStock: true,
        }));
      }
    }

    // ENHANCED: Check for options as an alternative to variants
    if (
      (productSizes.length === 0 || productColors.length === 0) &&
      apiProduct.options
    ) {
      const options = Array.isArray(apiProduct.options)
        ? apiProduct.options
        : [apiProduct.options];

      options.forEach((option) => {
        const optionName = option.name ? option.name.toLowerCase() : "";
        const optionValues = option.values || [];

        if (optionName.includes("size") && productSizes.length === 0) {
          productSizes = Array.isArray(optionValues)
            ? optionValues
            : [optionValues];
        }

        if (optionName.includes("color") && productColors.length === 0) {
          productColors = Array.isArray(optionValues)
            ? optionValues
            : [optionValues];

          // Convert color strings to objects
          productColors = productColors.map((color) =>
            typeof color === "string"
              ? {
                  name: color,
                  code: getColorCode(color),
                  inStock: true,
                }
              : color
          );
        }
      });
    }

    // ENHANCED: Check for sizes and colors in direct properties
    if (productSizes.length === 0 && apiProduct.sizes) {
      productSizes = Array.isArray(apiProduct.sizes)
        ? apiProduct.sizes
        : [apiProduct.sizes];
    }

    if (productColors.length === 0 && apiProduct.colors) {
      if (Array.isArray(apiProduct.colors)) {
        productColors = apiProduct.colors.map((color) =>
          typeof color === "string"
            ? {
                name: color,
                code: getColorCode(color),
                inStock: true,
              }
            : color
        );
      } else if (typeof apiProduct.colors === "string") {
        productColors = [
          {
            name: apiProduct.colors,
            code: getColorCode(apiProduct.colors),
            inStock: true,
          },
        ];
      }
    }

    // Default sizes and colors if none found
    if (productSizes.length === 0) {
      productSizes = ["S", "M", "L"];
      console.warn(
        "No sizes found in product data, using defaults:",
        productSizes
      );
    } else {
      console.log("Extracted Sizes:", productSizes);
    }

    if (productColors.length === 0) {
      productColors = [{ name: "Black", code: "#000000", inStock: true }];
      console.warn(
        "No colors found in product data, using defaults:",
        productColors
      );
    } else {
      console.log("Extracted Colors:", productColors);
    }

    // ENHANCED: More flexible price extraction
    let priceValue = null;

    if (typeof apiProduct.price === "number") {
      priceValue = apiProduct.price;
    } else if (
      typeof apiProduct.price === "string" &&
      !isNaN(parseFloat(apiProduct.price))
    ) {
      priceValue = parseFloat(apiProduct.price);
    } else if (apiProduct.priceValue) {
      priceValue =
        typeof apiProduct.priceValue === "number"
          ? apiProduct.priceValue
          : parseFloat(apiProduct.priceValue);
    } else if (apiProduct.variants && apiProduct.variants.length > 0) {
      // Try to get price from first variant
      const firstVariant = apiProduct.variants[0];
      if (firstVariant.price) {
        priceValue =
          typeof firstVariant.price === "number"
            ? firstVariant.price
            : parseFloat(firstVariant.price);
      } else if (firstVariant.price?.amount) {
        priceValue = parseFloat(firstVariant.price.amount);
      }
    } else if (
      apiProduct.variants &&
      apiProduct.variants.edges &&
      apiProduct.variants.edges.length > 0
    ) {
      // Try to get price from first edge variant (GraphQL)
      const firstVariant = apiProduct.variants.edges[0].node;
      if (firstVariant.price) {
        priceValue =
          typeof firstVariant.price === "number"
            ? firstVariant.price
            : parseFloat(firstVariant.price);
      } else if (firstVariant.price?.amount) {
        priceValue = parseFloat(firstVariant.price.amount);
      }
    }

    if (priceValue === null || isNaN(priceValue)) {
      priceValue = 0;
      console.warn(
        "Could not extract valid price from product data, using default:",
        priceValue
      );
    }

    const processedProduct = {
      id: apiProduct.id,
      name: apiProduct.title || apiProduct.name || "Unnamed Product",
      price: formatPrice(priceValue),
      images:
        productImages.length > 0 ? productImages : ["/images/placeholder.jpg"],
      description: apiProduct.description || "No description available",
      sizes: productSizes,
      colors: productColors,
      variants: productVariants,
    };

    console.log("Processed Product:", processedProduct);
    return processedProduct;
  };

  // Helper function to get color codes
  const getColorCode = (colorName) => {
    const colorMap = {
      Black: "#000000",
      White: "#FFFFFF",
      Red: "#FF0000",
      Green: "#008000",
      Blue: "#0000FF",
      Yellow: "#FFFF00",
      Pink: "#FFC0CB",
      Purple: "#800080",
      Orange: "#FFA500",
      Gray: "#808080",
      Brown: "#A52A2A",
      Beige: "#F5F5DC",
      Maroon: "#800000",
      Coral: "#FF7F50",
      Burgundy: "#800020",
    };

    return colorMap[colorName] || "#000000";
  };

  // Format price helper
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString();
    }
    if (typeof price === "string" && !isNaN(parseFloat(price))) {
      return parseFloat(price).toLocaleString();
    }
    return price || "0.00";
  };

  // Keep existing processShopifyProduct function as a fallback
  const processShopifyProduct = (rawProduct) => {
    if (!rawProduct) return null;

    // Extract images
    let productImages = [];
    if (rawProduct.images) {
      // Direct array format
      if (Array.isArray(rawProduct.images)) {
        productImages = rawProduct.images;
      }
      // Edges format from Shopify API
      else if (rawProduct.images.edges) {
        productImages = rawProduct.images.edges.map((edge) => edge.node.url);
      }
    }

    // If no images found, use the ones from the transformed product
    if (productImages.length === 0 && rawProduct.priceValue !== undefined) {
      productImages = rawProduct.images || [];
    }

    // Extract sizes and colors from variants
    let productSizes = [];
    let productColors = [];

    // Extract from variants structure provided
    if (rawProduct.variants && Array.isArray(rawProduct.variants)) {
      // Get unique sizes
      productSizes = [
        ...new Set(rawProduct.variants.map((variant) => variant.size)),
      ];
      // Get unique colors
      productColors = [
        ...new Set(rawProduct.variants.map((variant) => variant.color)),
      ].map((colorName) => ({
        name: colorName,
        code: getColorCode(colorName),
        inStock: true,
      }));
    }
    // Extract from other potential structures
    else if (rawProduct.options) {
      const sizeOption = rawProduct.options.find(
        (opt) => opt.name.toLowerCase() === "size"
      );
      productSizes = sizeOption?.values || [];

      const colorOption = rawProduct.options.find(
        (opt) => opt.name.toLowerCase() === "color"
      );
      if (colorOption?.values) {
        productColors = colorOption.values.map((color) => ({
          name: color,
          code: getColorCode(color),
          inStock: true,
        }));
      }
    }
    // Use sizes if already extracted in product grid
    else if (rawProduct.sizes) {
      productSizes = rawProduct.sizes;
    }

    // Format price
    let formattedPrice = "0.00";
    if (rawProduct.priceValue) {
      // Already processed price
      formattedPrice = rawProduct.priceValue.toLocaleString();
    } else if (rawProduct.variants?.edges?.length > 0) {
      // First variant price from Shopify API
      const price = rawProduct.variants.edges[0].node.price?.amount;
      if (price) {
        formattedPrice = parseFloat(price).toLocaleString();
      }
    } else if (rawProduct.price) {
      // Direct price property
      if (typeof rawProduct.price === "number") {
        formattedPrice = rawProduct.price.toLocaleString();
      } else {
        formattedPrice = rawProduct.price;
      }
    }

    return {
      id: rawProduct.id,
      name: rawProduct.title || rawProduct.name,
      price: formattedPrice,
      images:
        productImages.length > 0 ? productImages : ["/images/placeholder.jpg"],
      description: rawProduct.description || "No description available",
      sizes: productSizes.length > 0 ? productSizes : ["S", "M", "L"],
      colors:
        productColors.length > 0
          ? productColors
          : [{ name: "Blue", code: "#0000FF", inStock: true }],
      variants: rawProduct.variants || [],
    };
  };

  // Determine if product can be added to cart
  const canAddToCart = useMemo(() => {
    return (
      selectedSize !== "" &&
      (product?.colors?.length === 0 || selectedColor !== "")
    );
  }, [selectedSize, selectedColor, product?.colors]);

  // Fallback data for related products
  const relatedProducts = [
    {
      name: "Sybil Scarf - Black",
      color: "BLACK",
      price: "78,000",
      image: "/images/stylewith.jpg",
    },
    {
      name: "Sybil Scarf - Pink",
      color: "PINK",
      price: "56,000",
      image: "/images/stylewith2.jpg",
    },
  ];

  // Fallback data for purchased products
  const purchasedProducts = [
    {
      name: "Purchased 1",
      price: 1000,
      color: "BEIGE",
      images: "/images/photo6.jpg",
    },
    {
      name: "Purchased 2",
      price: 1200,
      color: "MAROON",
      images: "/images/photo11.jpg",
    },
    {
      name: "Purchased 3",
      price: 800,
      color: "CORAL",
      images: "/images/photo6.jpg",
    },
    {
      name: "Purchased 4",
      price: 900,
      color: "BURGUNDY",
      images: "/images/photo11.jpg",
    },
  ];

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!canAddToCart) return;

    setIsAddingToCart(true);

    // Generate a unique ID for this product + size + color combination
    const productWithOptions = {
      ...product,
      id: `${product.id || product.name}-${selectedColor || "default"}-${
        selectedSize || "default"
      }`,
      selectedSize,
      selectedColor,
    };

    // Try to add to cart - returns false if already in cart
    addToCart(productWithOptions);

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 800);
  };

  // Toggle wishlist state
  const handleToggleWishlist = () => {
    if (!product) return;

    const productForWishlist = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color:
        selectedColor ||
        (product.colors && product.colors.length > 0
          ? product.colors[0].name
          : null),
    };

    const isNowInWishlist = toggleWishlist(productForWishlist);
    setIsInWishlistState(isNowInWishlist);
  };

  // Color selection handler
  // When a color is selected, either update the display images or navigate to the variant
  const handleColorSelect = (colorName, variantId, variantHandle) => {
    console.log(
      `Color selected: ${colorName}, variant ID: ${variantId}, handle: ${variantHandle}`
    );

    // If selected color is for the current product, just update the selected color
    if (variantId === productId || !variantHandle) {
      console.log(`Selecting color ${colorName} on current product`);
      setSelectedColor(colorName);

      // Find images for this color
      const colorImages = getImagesForColor(colorName);
      setDisplayImages(colorImages.length > 0 ? colorImages : product.images);
    } else {
      // If it's another variant, navigate to that product
      console.log(`Navigating to variant with color ${colorName}`);

      // Determine what to use for navigation: handle or id
      const navTarget = variantHandle || variantId;
      console.log(`Navigation target: ${navTarget}`);

      navigate(`/product/${navTarget}`);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">{error}</h2>
        <button
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-4 py-2"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Render no product state
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">Product not found</h2>
        <button
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-4 py-2"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const renderColorVariantsUI = () => {
    if (!colorVariants || colorVariants.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium">OTHER COLOR OPTIONS:</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {colorVariants.map((variant, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                className="w-[40px] h-[40px] overflow-hidden border border-gray-300 rounded-full"
                onClick={() =>
                  navigate(`/product/${variant.handle || variant.id}`)
                }
              >
                <img
                  src={variant.image}
                  alt={variant.color}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="text-xs mt-1">{variant.color}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mx-4 sm:mx-6 md:mx-[40px] lg:mx-[80px]">
        <div className="mt-[60px] sm:mt-[80px] md:mt-[100px] flex flex-col md:flex-row">
          {/* Left Side: Product Carousel */}
          <div className="mb-8 md:mb-0 md:mr-[50px] w-full md:w-auto md:flex-1">
            <ProductCarousel images={displayImages} />

            {/* Related Products - Also inside the max-w-screen-xl container */}
            <div className="mt-[50px]">
              <h2 className="text-[15px] mb-4 text-center">STYLE IT WITH</h2>
              {loadingRelated ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
                </div>
              ) : styleWithProducts.length > 0 ? (
                <div className="grid gap-4 md:gap-6">
                  {styleWithProducts.map((product, index) => (
                    <SmallProductCard
                      key={product.id || index}
                      image={
                        product.images?.[0] ||
                        product.image ||
                        "/images/placeholder.jpg"
                      }
                      name={product.title || product.name}
                      color={product.color || "Default"}
                      price={`₦${parseFloat(product.price).toLocaleString()}`}
                      onViewProduct={() => navigate(`/product/${product.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6">
                  {relatedProducts.map((product, index) => (
                    <SmallProductCard
                      key={index}
                      image={product.image}
                      name={product.name}
                      color={product.color}
                      price={product.price}
                      onViewProduct={() =>
                        console.log(`Viewing ${product.name}`)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            {renderStyleItWith()}
          </div>

          {/* Right Side: Product Details */}
          <div className="w-full md:w-[400px] flex flex-col justify-start">
            {/* Product Name */}
            <h1 className="text-xl font-normal">{product.name}</h1>
            {/*  Star Rating */}
            <StarRating
              rating={4.9}
              reviewCount={90}
              scrollToReviews={scrollToReviews}
            />

            {/* Product Price */}
            <p className="text-lg font-semibold text-gray-700">
              ₦ {product.price}
            </p>

            <hr className="border-t border-gray-300 my-4" />

            {/* Color Selection - Only show if there are colors */}
            <ColorVariants
              product={product}
              productId={productId}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              setDisplayImages={setDisplayImages}
            />

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium">SIZE:</p>
                <button
                  className="text-[12px] underline cursor-pointer"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  Size Guide
                </button>
              </div>

              {/* Size Guide Modal */}
              <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setSizeGuideOpen(false)}
              />
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`border w-[40px] h-[40px] text-[10px] font-normal items-center cursor-pointer ${
                      selectedSize === size
                        ? "border-black border-width-[0.5px]"
                        : "border-gray-300 hover:bg-gray-100"
                    } transition-colors`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              className={`w-full py-3 transition-colors cursor-pointer text-[13.7px] ${
                canAddToCart
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAddingToCart}
              whileTap={{ scale: canAddToCart ? 0.98 : 1 }}
              animate={{
                opacity: isAddingToCart ? 0.7 : 1,
              }}
            >
              {isAddingToCart
                ? "ADDING TO BAG..."
                : canAddToCart
                ? "ADD TO SHOPPING BAG"
                : `SELECT ${product.colors.length > 0 ? "COLOR AND " : ""}SIZE`}
            </motion.button>

            {/* Wishlist Button */}
            <div
              className="flex items-center justify-start gap-2 text-[13px] mt-4 mb-2 cursor-pointer"
              onClick={handleToggleWishlist}
            >
              {isInWishlist ? (
                <FaHeart className="h-[15px] w-[15px] text-black" />
              ) : (
                <FiHeart className="h-[15px] w-[15px]" />
              )}
              <span>
                {isInWishlistState ? "Remove from Wishlist" : "Add to Wishlist"}
              </span>
            </div>

            <hr className="border-t border-gray-300 my-4" />

            {/* Expandable Sections */}
            <ExpandableSection
              title="PRODUCT DETAILS"
              content={product.description}
            />
            <ExpandableSection
              title="MATERIAL & COMPOSITION"
              content={product.material || "Information not available"}
            />
            <ExpandableSection
              title="SIZE & FIT"
              content="Our dresses are available in various sizes to ensure a perfect fit for everyone. Please refer to the size chart for more details."
            />
            <ExpandableSection
              title="CARE INSTRUCTIONS"
              content={
                product.care ||
                "Handle with care. See label for detailed instructions."
              }
            />
            <ExpandableSection
              title="SHIPPING"
              content="We offer fast and reliable shipping nationwide. Your order will be processed and shipped within 2-3 business days."
            />
            <ExpandableSection
              title="RETURNS"
              content="If you're not satisfied with your purchase, you may return the item within 30 days for a full refund."
            />
          </div>
        </div>
      </div>

      <div ref={reviewsRef}>
        <CustomersReviews productName={product.name} />
      </div>

      <div className="mx-[20px] mt-[50px] mb-[100px]">
        {/* Customers Also Purchased Section */}
        {(alsoPurchasedProducts.length > 0 || !loadingRelated) && (
          <>
            <h2 className="text-[15px] text-center uppercase mt-[50px] mb-[50px]">
              ALLURVERS ALSO PURCHASED
            </h2>
            {loadingRelated ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
              </div>
            ) : alsoPurchasedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[20px] md:gap-[20px]">
                {alsoPurchasedProducts.map((product) => (
                  <PurchasedCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.title || product.name,
                      price: parseFloat(product.price),
                      color: product.color || "DEFAULT",
                      images:
                        product.images?.[0] ||
                        product.image ||
                        "/images/placeholder.jpg",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[20px] md:gap-[20px]">
                {purchasedProducts.map((product, index) => (
                  <PurchasedCard key={index} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Customers Also Viewed Section */}
        {(alsoViewedProducts.length > 0 || !loadingRelated) && (
          <>
            <h2 className="text-[15px] text-center uppercase mt-[50px] mb-[50px]">
              ALLURVERS ALSO VIEWED
            </h2>
            {loadingRelated ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
              </div>
            ) : alsoViewedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[20px] md:gap-[20px]">
                {alsoViewedProducts.map((product) => (
                  <PurchasedCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.title || product.name,
                      price: parseFloat(product.price),
                      color: product.color || "DEFAULT",
                      images:
                        product.images?.[0] ||
                        product.image ||
                        "/images/placeholder.jpg",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[20px] md:gap-[20px]">
                {purchasedProducts.map((product, index) => (
                  <PurchasedCard key={index} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div ref={reviewsRef}>
        <CustomersReviews productName={product.name} />
      </div>

      <Footer />
    </>
  );
};

export default ProductDetailsPage