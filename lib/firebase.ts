import { ca } from "date-fns/locale";
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // <--- MUST MATCH NEW .ENV NAME
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (prevent duplicate initialization in Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

/**
 * Uploads an image to the 'salons' folder with subfolders organized by salonCode
 * Path: salons/[salonCode]/[filename]
 * Returns an object containing the download URL and storage path
 */
export const uploadSalonImage = async (file: File, salonCode: string): Promise<{ url: string; path: string }> => {
  try {
    // 1. Create a reference to the specific subfolder path
    const storagePath = `salons/${salonCode}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    // 2. Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // 3. Get the public download URL to save in your database
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
};

export const uploadTransactionImage = async (file: File, userId: string, salonCode: string, referenceId: string): Promise<{ url: string; path: string }> => {
  try {
    //todo need to change the folder path making 
    // Validate file type - only PDFs and images allowed
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only PDF and image files (JPEG, PNG, WebP) are allowed. Received: ${file.type}`);
    }

    // Validate file size - max 3MB
    const maxSizeInBytes = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size exceeds 3MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    const storagePath = `transactions/${userId}/${salonCode}/${referenceId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: storagePath
    };

  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
}

export const uploadAdImages = async (file: File, salonCode: string, adId: string): Promise<{ url: string; path: string }> => {
  try {
    // Validate file type - only images allowed
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only image files (JPEG, PNG, WebP) are allowed. Received: ${file.type}`);
    }
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    const storagePath = `ads/${salonCode}/${adId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: storagePath

    };
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
}

export const uploadAdVideos = async (file: File, salonCode: string, adId: string): Promise<{ url: string; path: string }> => {
  try {
    // Validate file type - only videos allowed
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only video files (MP4, WebM, Ogg) are allowed. Received: ${file.type}`);
    }
    const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size exceeds 100MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    const storagePath = `ads/${salonCode}/${adId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: storagePath

    };
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
}

export const uploadProfileImage = async (file: File, userId: string): Promise<{ url: string; path: string }> => {
  try {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only PDF and image files (JPEG, PNG, WebP) are allowed. Received: ${file.type}`);
    }
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    const storagePath = `profile/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error: any) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
}
