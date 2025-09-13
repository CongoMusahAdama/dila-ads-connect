/**
 * Constructs the full image URL from a stored image path
 * @param imagePath - The stored image path (e.g., "/uploads/filename.jpg" or just "filename.jpg")
 * @returns The full URL to access the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return "/placeholder.svg";
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('Full URL provided:', imagePath);
    return imagePath;
  }

  // Get the base URL from environment or default to localhost:3001
  // For images, we need the server root URL, not the API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get server root
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  const fullUrl = `${baseUrl}/${cleanPath}`;
  console.log('Generated image URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

/**
 * Gets the image URL for billboard images, handling both imageUrl and image_url fields
 * @param billboard - The billboard object
 * @returns The full URL to access the billboard image
 */
export const getBillboardImageUrl = (billboard: any): string => {
  const imagePath = billboard.imageUrl || billboard.image_url;
  return getImageUrl(imagePath);
};
