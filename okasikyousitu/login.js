import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCOg_uOsP63xwbUoZCThzx8HhUt-HKBdHs",
  authDomain: "okashi-yoyaku-1c1c8.firebaseapp.com",
  projectId: "okashi-yoyaku-1c1c8",
  storageBucket: "okashi-yoyaku-1c1c8.firebasestorage.app",
  messagingSenderId: "833932336581",
  appId: "1:833932336581:web:a7e5199be43210fbda7fac",
  measurementId: "G-GZWNS6882W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// トースト
const toast = document.createElement("div");
toast.id = "toast";
document.body.appendChild(toast);
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  toast.style.animation = "popIn 0.4s ease";
  setTimeout(() => { toast.classList.remove("show"); toast.style.animation = ""; }, 2500);
}

// 新規登録
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast("新規登録完了🎀");
  } catch (err) {
    showToast("エラー：" + err.message);
  }
});

// ログイン
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("ログイン成功🎉");
  } catch (err) {
    showToast("エラー：" + err.message);
  }
});

// ログイン状態確認 → すでにログイン済みなら予約ページへ
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "reservation.html";
  }
});
