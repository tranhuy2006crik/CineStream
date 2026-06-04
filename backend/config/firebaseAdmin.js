import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isFirebaseInitialized = false;

try {
  // If FIREBASE_SERVICE_ACCOUNT_PATH is defined, try loading it
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin initialized successfully using service account file.');
  } else {
    // Alternatively, load from env variables if provided
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace \n with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
      isFirebaseInitialized = true;
      console.log('Firebase Admin initialized successfully using env variables.');
    } else {
      console.warn('Firebase Admin is not initialized. Please provide serviceAccountKey.json or env variables.');
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const verifyIdToken = async (idToken) => {
  console.log('verifyIdToken called. isFirebaseInitialized:', isFirebaseInitialized);
  if (!isFirebaseInitialized) {
    throw new Error('Firebase Admin is not configured on this server.');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token: ' + error.message);
  }
};

export default admin;
