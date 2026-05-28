/**
 * Image processing utilities for client-side HEIC conversion,
 * resizing, compression, and Firebase error handling.
 */

/**
 * Detects if a file is an Apple HEIC/HEIF image.
 */
export function isHEICFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

/**
 * Converts a HEIC/HEIF file to a standard JPEG File.
 */
export async function convertHEICtoJPEG(file: File): Promise<File> {
  try {
    const heic2any = (await import('heic2any')).default;
    const jpegBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });

    const blob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
    const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    
    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch (error) {
    console.error("HEIC conversion error, falling back to original file:", error);
    return file;
  }
}

/**
 * Resizes and compresses an image file using an HTML5 Canvas client-side.
 */
export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    // Canvas operation is only available in browser environment
    if (typeof window === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Only resize if the image exceeds max boundaries
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        } else {
          // No resizing needed, but we can still compress it to save bandwidth
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Fully pre-processes an uploaded file: converts HEIC to JPEG if needed,
 * and compresses it to ensure safe, fast, and high-res mobile uploads.
 */
export async function preprocessImage(file: File): Promise<File> {
  let processedFile = file;

  // 1. HEIC Conversion
  if (isHEICFile(file)) {
    processedFile = await convertHEICtoJPEG(file);
  }

  // 2. Client-side canvas compression (max 1600x1600, 80% quality)
  // Skip compression for very small files (e.g. under 100KB) to preserve absolute quality
  if (processedFile.size > 100 * 1024) {
    processedFile = await compressImage(processedFile, 1600, 1600, 0.8);
  }

  return processedFile;
}

/**
 * Translates Firebase Storage errors into clear, actionable, user-friendly messages.
 */
export function getFriendlyStorageError(error: any): { title: string; description: string } {
  const code = error?.code || '';
  console.error("Firebase Storage original error:", error);

  switch (code) {
    case 'storage/unauthorized':
      return {
        title: "Permission Denied",
        description: "You do not have permission to upload photos here. Please verify you are logged in as an administrator."
      };
    case 'storage/quota-exceeded':
      return {
        title: "Storage Limit Reached",
        description: "The sanctuary's storage quota has been exceeded. Please contact the system administrator."
      };
    case 'storage/retry-limit-exceeded':
    case 'storage/cannot-slice-blob':
      return {
        title: "Upload Timed Out",
        description: "The connection timed out during upload. This usually happens with large files on slow mobile connections. Our new optimization will now compress files automatically, so please try again!"
      };
    case 'storage/invalid-argument':
      return {
        title: "Invalid File",
        description: "The selected file is invalid or corrupt. Please select another image."
      };
    default:
      return {
        title: "Upload Failed",
        description: error?.message || "Could not save the image. Please check your network and try again."
      };
  }
}
