// frontend/src/admin/forms/SectionForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiImage, FiPlus, FiTrash,  // Keep your existing imports
  FiMonitor, FiSmartphone, FiInfo, FiVideo        // Add these new ones
} from 'react-icons/fi';
import SectionPreview from '../components/SectionPreview';
import { toast } from 'react-hot-toast';
import api from '../../services/api';


const SectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
     name: '',
  type: 'custom',
  deviceType: 'desktop', // Add this line to track device type
  content: {
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    alignment: 'center'
  },
  media: {
    imageUrl: '',
    videoUrl: '',
    altText: ''
  },
  products: [],
  isActive: true,
  order: 0
});
  
  const [availableProducts, setAvailableProducts] = useState([]);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  
  // Section types
  const sectionTypes = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'featured-products', label: 'Featured Products' },
    { value: 'banner', label: 'Banner' },
    { value: 'collection', label: 'Collection' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'custom', label: 'Custom Section' }
  ];
  
  // Alignment options
  const alignmentOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];
  useEffect(() => {
  if (!isEditing) {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceParam = urlParams.get('device');
    
    // If device param exists and is valid, update the form data
    if (deviceParam && (deviceParam === 'mobile' || deviceParam === 'desktop')) {
      const updatedName = `${deviceParam === 'mobile' ? 'Mobile' : 'Desktop'} ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`;
      
      setFormData(prev => ({
        ...prev,
        deviceType: deviceParam,
        name: updatedName
      }));
    }
  }
}, [isEditing]);

  // Load section data if editing
  useEffect(() => {
    const loadData = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const response = await api.get(`/cms/sections/${id}`);
          setFormData(response.data.data);
        } catch (err) {
          setError('Failed to load section data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [id, isEditing]);
  
  // Load products and media
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get('/products');
        setAvailableProducts(response.data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    
    const loadMedia = async () => {
      try {
        const response = await api.get('/cms/media?type=image');
        setMediaLibrary(response.data.data || []);
      } catch (err) {
        console.error('Failed to load media:', err);
      }
    };
    
    loadProducts();
    loadMedia();
  }, []);

  // Enhanced form validation with detailed error messages
  const validateForm = () => {
        const newErrors = {};
        
        // Basic validations
        if (!formData.name.trim()) {
        newErrors.name = 'Section name is required';
        }
        
        // Type-specific validations
        switch (formData.type) {
        case 'hero':
            if (!formData.content.title) {
            newErrors['content.title'] = 'Hero title is required';
            }
            if (!formData.media.imageUrl) {
            newErrors['media.imageUrl'] = 'Background image is required for hero sections';
            }
            break;
            
        case 'banner':
            if (!formData.content.title) {
            newErrors['content.title'] = 'Banner title is required';
            }
            if (!formData.media.imageUrl) {
            newErrors['media.imageUrl'] = 'Banner image is required';
            }
            break;
            
        case 'featured-products':
            if (!formData.content.title) {
            newErrors['content.title'] = 'Section title is required';
            }
            if (formData.products.length === 0) {
            newErrors.products = 'Please select at least one product';
            }
            break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (e.g., content.title)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    // Clear any previous error/success messages
    setError('');
    setSuccess('');
  };
  
  // Handle product selection
  const handleProductSelection = (productId) => {
    setFormData({
      ...formData,
      products: formData.products.includes(productId)
        ? formData.products.filter(id => id !== productId)
        : [...formData.products, productId]
    });
  };
  
  // Handle media selection
  const handleMediaSelect = (mediaItem) => {
    setFormData({
      ...formData,
      media: {
        ...formData.media,
        imageUrl: mediaItem.url,
        altText: mediaItem.altText || mediaItem.name
      }
    });
    setShowMediaLibrary(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Section name is required';
    }
    
    // Type-specific validations
    if (formData.type === 'hero' || formData.type === 'banner') {
      if (!formData.content.title) {
        newErrors['content.title'] = 'Title is required for this section type';
      }
      if (!formData.media.imageUrl && formData.type === 'hero') {
        newErrors['media.imageUrl'] = 'Background image is required for hero sections';
      }
    }
    
    if (formData.type === 'featured-products' && formData.products.length === 0) {
      newErrors.products = 'Please select at least one product';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // API endpoint and method based on editing or creating
      const url = isEditing 
        ? `/cms/sections/${id}` 
        : '/cms/sections';
      
      const method = isEditing ? 'put' : 'post';
      
      const response = await api[method](url, formData);
      
      if (response.data.success) {
        setSuccess(isEditing 
          ? 'Section updated successfully!' 
          : 'Section created successfully!');
        
        toast.success(isEditing ? 'Section updated!' : 'Section created!');
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setError(response.data.message || 'An error occurred');
        toast.error('Failed to save section');
      }
    } catch (err) {
      setError('Failed to save section. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to save section');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  // Add this error display component
    /*const FormFieldError = ({ name }) => {
  if (!errors[name]) return null;
  
  return (
    <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
  );
};*/

    const renderSectionPreview = () => {
        // Only show preview if we have enough data
        if (!formData.name || !formData.type) {
          return (
            <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-500">
                Fill in the section details to see a preview
              </p>
            </div>
          );
        }
      
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-md font-medium mb-4">Section Preview</h3>
              <div className="mx-auto max-w-md">
                <SectionPreview section={formData} />
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                This is a simplified preview. The actual section may appear differently on the website.
              </p>
            </div>
          </div>
        );
      };
    
  // Render different fields based on section type
  const renderTypeSpecificFields = () => {
    switch (formData.type) {
        case 'hero':
  return (
    <>
      {/* Device type selector tabs */}
      <div className="col-span-2 mb-4">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData, 
                deviceType: 'desktop',
                name: formData.name.replace('Mobile', 'Desktop')
              });
            }}
            className={`flex items-center py-2 px-4 ${
              !formData.deviceType || formData.deviceType === 'desktop' 
                ? 'border-b-2 border-black text-black font-medium'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <FiMonitor className="mr-2" />
            Desktop Version
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData, 
                deviceType: 'mobile',
                name: formData.name.replace('Desktop', 'Mobile')
              });
            }}
            className={`flex items-center py-2 px-4 ${
              formData.deviceType === 'mobile' 
                ? 'border-b-2 border-black text-black font-medium'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <FiSmartphone className="mr-2" />
            Mobile Version
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 flex items-center">
          <FiInfo className="mr-1" />
          {formData.deviceType === 'mobile' 
            ? 'Content optimized for mobile devices. This will only show on small screens.'
            : 'Content optimized for desktop and tablet devices. This will show on larger screens.'}
        </p>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hero Title
        </label>
        <input
          type="text"
          name="content.title"
          value={formData.content.title}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Title text that appears on the hero section (e.g., "EXPLORE")
        </p>
      </div>
      
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          name="content.subtitle"
          value={formData.content.subtitle}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="content.description"
          value={formData.content.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Button Text
        </label>
        <input
          type="text"
          name="content.buttonText"
          value={formData.content.buttonText}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Button Link
        </label>
        <input
          type="text"
          name="content.buttonLink"
          value={formData.content.buttonLink}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Where the hero button should link to (e.g., "#shop-now", "/collections")
        </p>
      </div>
      
      {/* Background Image Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Image
        </label>
        <div className="flex">
          <input
            type="text"
            name="media.imageUrl"
            value={formData.media.imageUrl}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-l-md"
            placeholder="Image URL"
          />
          <button
            type="button"
            onClick={() => setShowMediaLibrary(true)}
            className="bg-gray-200 px-4 flex items-center rounded-r-md"
          >
            <FiImage />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formData.deviceType === 'mobile' 
            ? 'Use a portrait (vertical) image for better mobile experience'
            : 'If no video is set, this image will be used as the background'}
        </p>
      </div>
      
      {/* Background Video Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Video URL
        </label>
        <input
          type="text"
          name="media.videoUrl"
          value={formData.media.videoUrl || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="https://example.com/video.mp4"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.deviceType === 'mobile' 
            ? 'Videos may use more data on mobile. Consider keeping it short.'
            : 'MP4 video URL - will take precedence over image if provided'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Alignment
        </label>
        <select
          name="content.alignment"
          value={formData.content.alignment}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {alignmentOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Preview section - only shown if we have an image or video */}
      {(formData.media.imageUrl || formData.media.videoUrl) && (
        <div className="col-span-2 mt-4 border-t pt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            {formData.deviceType === 'mobile' ? (
              <>
                <FiSmartphone className="mr-1" /> Mobile Preview
              </>
            ) : (
              <>
                <FiMonitor className="mr-1" /> Desktop Preview  
              </>
            )}
          </h3>
          <div 
            className={`relative overflow-hidden border border-gray-200 rounded ${
              formData.deviceType === 'mobile' 
                ? 'h-96 max-w-xs mx-auto' // Mobile preview size
                : 'h-72 w-full' // Desktop preview size
            }`}
          >
            {formData.media.videoUrl ? (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <FiVideo className="mx-auto mb-2 text-3xl" />
                  <p className="text-sm">Video will play here</p>
                  <p className="text-xs mt-1">{formData.media.videoUrl}</p>
                </div>
              </div>
            ) : formData.media.imageUrl ? (
              <img 
                src={formData.media.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : null}
            
            {/* Content preview */}
            <div className={`absolute inset-0 ${
              formData.content.alignment === 'left' ? 'text-left pl-6' : 
              formData.content.alignment === 'right' ? 'text-right pr-6' : 
              'text-center'
            } flex flex-col justify-center`}>
              <div className="bg-black bg-opacity-40 p-4 inline-block">
                {formData.content.title && (
                  <h2 className="text-white text-xl font-bold mb-2">{formData.content.title}</h2>
                )}
                {formData.content.subtitle && (
                  <p className="text-white text-sm">{formData.content.subtitle}</p>
                )}
                {formData.content.buttonText && (
                  <button className="mt-3 px-4 py-1 bg-white text-black text-sm">
                    {formData.content.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
        
      case 'featured-products':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                name="content.title"
                value={formData.content.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Description
              </label>
              <textarea
                name="content.description"
                value={formData.content.description}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Products to Feature
              </label>
              
              <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto p-2">
                {availableProducts.length > 0 ? (
                  availableProducts.map(product => (
                    <div key={product.id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={formData.products.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={`product-${product.id}`}
                        className="flex items-center cursor-pointer"
                      >
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-10 h-10 object-cover mr-2"
                          />
                        )}
                        <span className="text-sm">{product.title}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 p-2">No products available</p>
                )}
              </div>
            </div>
          </>
        );
        
      case 'banner':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Title
              </label>
              <input
                type="text"
                name="content.title"
                value={formData.content.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Description
              </label>
              <textarea
                name="content.description"
                value={formData.content.description}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                name="content.buttonText"
                value={formData.content.buttonText}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                name="content.buttonLink"
                value={formData.content.buttonLink}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="media.imageUrl"
                  value={formData.media.imageUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="bg-gray-200 px-4 flex items-center rounded-r-md"
                >
                  <FiImage />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <select
                name="content.alignment"
                value={formData.content.alignment}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {alignmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
        
      // Additional cases for other section types
      default:
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                name="content.title"
                value={formData.content.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content.description"
                value={formData.content.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="media.imageUrl"
                  value={formData.media.imageUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="bg-gray-200 px-4 flex items-center rounded-r-md"
                >
                  <FiImage />
                </button>
              </div>
            </div>
          </>
        );
    }
  };
  
  // Media library modal
  const renderMediaLibrary = () => {
    if (!showMediaLibrary) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Media Library</h3>
            <button 
              onClick={() => setShowMediaLibrary(false)}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-3  md:grid-cols-4 gap-4">
            {mediaLibrary.length > 0 ? (
              mediaLibrary.map(media => (
                <div 
                  key={media._id} 
                  className="border border-gray-200 p-2 cursor-pointer hover:border-black"
                  onClick={() => handleMediaSelect(media)}
                >
                  <div className="h-24 bg-gray-100 flex items-center justify-center mb-2">
                    <img 
                      src={media.url} 
                      alt={media.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs truncate">{media.name}</p>
                </div>
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500 py-8">
                No media found. Please upload some images first.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mr-2 text-gray-500 hover:text-black"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-medium">
          {isEditing ? 'Edit Section' : 'Create New Section'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      {renderSectionPreview()}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Internal name for this section
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Display order (lower numbers appear first)
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium mb-4">Section Content</h3>
              <div className="grid grid-cols-2 gap-6">
                {renderTypeSpecificFields()}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 text-right">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 mr-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Save Section</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {renderMediaLibrary()}
    </div>
  );
};

export default SectionForm;