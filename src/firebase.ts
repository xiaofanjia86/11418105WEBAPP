/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDx4S8emMRVPJPfBYKldR4wSF2TUieVeAs",
  authDomain: "webapp-37ef0.firebaseapp.com",
  projectId: "webapp-37ef0",
  storageBucket: "webapp-37ef0.firebasestorage.app",
  messagingSenderId: "215041564024",
  appId: "1:215041564024:web:57d61642f900fdcd16fc8d",
  measurementId: "G-CGYVPKEGYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (Safely check if supported in current environment)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

// Validate connection to Firestore as outlined in Firebase Skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore 測試連線正常");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("請檢查 Firebase 設定，或確認當前網路連線。");
    } else {
      // 由於可能是初始專案或權限問題，略過一般錯誤輸出，僅做標記
      console.log("Firestore 連線測試已執行。");
    }
  }
}
testConnection();
