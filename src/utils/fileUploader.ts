/**
 * Helper utility to read local image or video files from the user's computer
 * and convert them into base64 Data URLs for instant preview and persistence.
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo convertir el archivo a string Data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validates whether an uploaded file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Validates whether an uploaded file is a video
 */
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};
