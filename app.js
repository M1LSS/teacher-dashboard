// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAtbaEMPmljXmEfUU7k00obcIh4WVfDo3Y",
  authDomain: "gdp-project-7831b.firebaseapp.com",
  projectId: "gdp-project-7831b",
  storageBucket: "gdp-project-7831b.appspot.com",
  messagingSenderId: "66153805050",
  appId: "1:66153805050:web:48ea3eefa8f2ae774a4543",
  databaseURL: "https://gdp-project-7831b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

// Login
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("dashboardContainer").style.display = "block";
      loadDashboard();
    })
    .catch(err => alert("Login failed: " + err.message));
});

// Load Dashboard
function loadDashboard() {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const today = new Date();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    week.push(d.toISOString().split("T")[0]);
  }

  const tbody = document.getElementById("attendanceBody");
  tbody.innerHTML = "";

  week.forEach(date => {
    db.ref(`attendance/${date}/${uid}`).once("value", snapshot => {
      const d = snapshot.val();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${date}</td>
        <td>${d ? d.status : 'Absent'}</td>
        <td>${d ? (d.substituted_by || '-') : '-'}</td>
        <td>
          ${d && d.status === 'Absent' ? `<input type="file" accept="image/*" onchange="uploadProof(this, '${date}', '${uid}')">` : '-'}
        </td>`;
      tbody.appendChild(tr);
    });
  });
}

// Upload Proof
function uploadProof(input, date, uid) {
  const file = input.files[0];
  if (!file) return;

  const ref = storage.ref(`proofs/${uid}_${date}`);
  ref.put(file).then(() => {
    alert("Proof uploaded successfully!");
  }).catch(err => {
    console.error("Upload failed:", err);
    alert("Failed to upload proof.");
  });
}

// Handle logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    location.reload();
  });
});
