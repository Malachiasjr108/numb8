
// Firebase Firestore storage for Echo images
import { db } from "./firebase-admin";

export async function saveEchoImageToFirestore(
  echoNumber: number,
  cloudStoragePath: string
): Promise<void> {
  try {
    await db.collection("echoImages").doc(String(echoNumber)).set({
      echoNumber,
      cloudStoragePath,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    // Fallback: If Firebase Admin fails, we still have S3
    // The image is safely stored in S3, Firestore is just metadata
  }
}

export async function getEchoImageFromFirestore(echoNumber: number) {
  try {
    const doc = await db.collection("echoImages").doc(String(echoNumber)).get();
    
    if (!doc.exists) {
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error("Error getting from Firestore:", error);
    return null;
  }
}

export async function getAllEchoImagesFromFirestore() {
  try {
    const snapshot = await db.collection("echoImages").orderBy("echoNumber", "asc").get();
    const images: any[] = [];
    
    snapshot.forEach((doc) => {
      images.push(doc.data());
    });

    return images;
  } catch (error) {
    console.error("Error getting all from Firestore:", error);
    return [];
  }
}

export async function deleteEchoImageFromFirestore(echoNumber: number): Promise<void> {
  try {
    await db.collection("echoImages").doc(String(echoNumber)).delete();
  } catch (error) {
    console.error("Error deleting from Firestore:", error);
  }
}
