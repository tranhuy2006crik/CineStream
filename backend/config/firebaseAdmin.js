import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isFirebaseInitialized = false;

const resolveServiceAccountPath = (serviceAccountPath) => {
  if (!serviceAccountPath) return null;

  if (path.isAbsolute(serviceAccountPath)) {
    return serviceAccountPath;
  }

  const candidates = [
    path.resolve(process.cwd(), serviceAccountPath),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', serviceAccountPath),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), serviceAccountPath),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
};

const initializeFirebaseAdmin = () => {
  try {
    if (admin.apps.length > 0) {
      isFirebaseInitialized = true;
      return;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
      isFirebaseInitialized = true;
      console.log('Firebase Admin initialized successfully using FIREBASE_SERVICE_ACCOUNT_JSON.');
      return;
    }

    const serviceAccountPath = resolveServiceAccountPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json');
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      isFirebaseInitialized = true;
      console.log('Firebase Admin initialized successfully using service account file.');
      return;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const googleCredentialsPath = resolveServiceAccountPath(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      if (googleCredentialsPath && fs.existsSync(googleCredentialsPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(googleCredentialsPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        isFirebaseInitialized = true;
        console.log('Firebase Admin initialized successfully using GOOGLE_APPLICATION_CREDENTIALS.');
        return;
      }
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      isFirebaseInitialized = true;
      console.log('Firebase Admin initialized successfully using env variables.');
      return;
    }

    console.warn('Firebase Admin is not initialized. Please provide a service account JSON file or the FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY values.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
};

initializeFirebaseAdmin();

export const verifyIdToken = async (idToken) => {
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
