import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// ================================
// 🔧 Firebase設定
// ================================
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
const db = getFirestore(app);

// ================================
// 📦 DOM要素
// ================================
const logoutBtn = document.getElementById("logout-btn");
const reservationSection = document.getElementById("reservation-section");
const reservationForm = document.getElementById("reservationForm");
const reservationList = document.getElementById("reservationList");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const toast = document.getElementById("toast");
const loading = document.getElementById("loading");

// ================================
// 🍰 トースト表示関数
// ================================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

// ================================
// 🔐 ログイン確認
// ================================
onAuthStateChanged(auth, (user) => {
  if (loading) loading.style.display = "none";

  if (!user) {
    window.location.href = "login.html";
  } else {
    reservationSection.classList.remove("hidden");
    loadReservations(user.uid);
  }
});

// ================================
// 🚪 ログアウト処理
// ================================
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    showToast("ログアウトしました🩷");
    setTimeout(() => (window.location.href = "login.html"), 1000);
  });
}

// ================================
// 📝 予約登録処理
// ================================
reservationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return showToast("ログインしてください🫣");

  const date = document.getElementById("date").value;
  const name = document.getElementById("name").value;
  const time = document.getElementById("time").value;
  const course = document.getElementById("course").value;
  const note = document.getElementById("note").value;

  try {
    await addDoc(collection(db, "reservations"), {
      userId: user.uid,
      date,
      name,
      time,
      course,
      note,
      createdAt: serverTimestamp(),
    });
    reservationForm.reset();
    showToast("予約が完了しました🍓");
    loadReservations(user.uid);
  } catch (error) {
    showToast("エラー：" + error.message);
  }
});

// ================================
// 📋 予約一覧を読み込み
// ================================
async function loadReservations(uid) {
  reservationList.innerHTML = "";
  const q = query(collection(db, "reservations"), where("userId", "==", uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    reservationList.innerHTML = "<li>まだ予約がありません🫖</li>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.classList.add("reservation-item");
    li.innerHTML = `
      <div class="reservation-info">
        <strong>${data.date}</strong> ${data.time} ｜ ${data.course} ｜ ${data.name}
        <br><small>${data.note || "備考なし"}</small>
      </div>
      <div class="reservation-actions">
        <button class="edit-btn" data-id="${docSnap.id}">変更</button>
        <button class="delete-btn" data-id="${docSnap.id}">削除</button>
      </div>
    `;
    reservationList.appendChild(li);
  });

  // 削除ボタン
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await deleteDoc(doc(db, "reservations", id));
      showToast("削除しました🗑️");
      loadReservations(uid);
    });
  });

  // 編集ボタン
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const docRef = doc(db, "reservations", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        openEditModal(id, snapshot.data());
      } else {
        showToast("データが見つかりません🥲");
      }
    });
  });
}

// ================================
// ✏️ 編集モーダルを開く
// ================================
function openEditModal(id, data) {
  editModal.classList.remove("hidden");
  document.getElementById("editName").value = data.name;
  document.getElementById("editDate").value = data.date;
  document.getElementById("editTime").value = data.time;
  document.getElementById("editCourse").value = data.course;
  document.getElementById("editNote").value = data.note || "";

  // 保存処理
  editForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "reservations", id), {
        name: document.getElementById("editName").value,
        date: document.getElementById("editDate").value,
        time: document.getElementById("editTime").value,
        course: document.getElementById("editCourse").value,
        note: document.getElementById("editNote").value,
      });
      editModal.classList.add("hidden");
      showToast("変更を保存しました🌸");
      loadReservations(auth.currentUser.uid);
    } catch (err) {
      showToast("更新エラー：" + err.message);
    }
  };

  // キャンセルボタン
  document.getElementById("cancelEdit").addEventListener("click", () => {
    editModal.classList.add("hidden");
  });
}

// ================================
// 🌸 モーダル背景クリックで閉じる
// ================================
window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.classList.add("hidden");
  }
});
