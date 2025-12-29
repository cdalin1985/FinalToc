
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary keys missing. Check .env file.");
    alert("Image upload failed: Missing Cloudinary Configuration.");
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export const uploadBase64ToCloudinary = async (base64Data: string): Promise<string | null> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) return null;

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary Base64 Error", error);
        return null;
    }
}