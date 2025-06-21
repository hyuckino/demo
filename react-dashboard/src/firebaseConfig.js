// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GithubAuthProvider, // GitHub OAuth 프로바이더는 유지
  signInWithPopup, // GitHub 팝업 로그인을 위해 유지
  signOut,
  createUserWithEmailAndPassword, // <-- 추가: 이메일/비밀번호로 사용자 생성
  signInWithEmailAndPassword // <-- 추가: 이메일/비밀번호로 로그인
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdtkyPokWB0KI0M1960DxsHIHcvC977jY",
  authDomain: "namanmu-demo.firebaseapp.com",
  projectId: "namanmu-demo",
  storageBucket: "namanmu-demo.firebasestorage.app",
  messagingSenderId: "829225687207",
  appId: "1:829225687207:web:eb0c7cf5585604c3742382"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// GitHub OAuth 프로바이더 (필요하면 유지)
const githubProvider = new GithubAuthProvider();

export {
  app,
  auth,
  db,
  signInWithPopup,
  signOut,
  collection,
  githubProvider,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  createUserWithEmailAndPassword, // <-- 내보내기 추가
  signInWithEmailAndPassword // <-- 내보내기 추가
};