import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "./config";

/**
 * Helper function to securely upload files to Firebase Storage
 * This ensures the user is authenticated before uploading
 */
export async function secureUpload(
  path: string, 
  file: File, 
  metadata?: { [key: string]: string }
): Promise<string> {
  // Check if the user is authenticated
  if (!auth.currentUser) {
    throw new Error("Upload failed: User not authenticated");
  }

  // Force token refresh to ensure it's valid
  await auth.currentUser.getIdToken(true);

  // Create storage reference
  const storageRef = ref(storage, path);

  // Prepare metadata with user ID for security rules
  const fullMetadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: auth.currentUser.uid,
      ...metadata
    }
  };

  // Upload the file with metadata
  await uploadBytes(storageRef, file, fullMetadata);
  
  // Get and return the download URL
  return await getDownloadURL(storageRef);
}

/**
 * Helper to check if user is authenticated and can upload
 */
export function canUpload(): boolean {
  return !!auth.currentUser;
} 