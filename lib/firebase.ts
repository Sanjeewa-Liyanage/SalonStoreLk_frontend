import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
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