
"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase-client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  writeBatch,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portal");
  const [stats, setStats] = useState({
    portal: 0,
    circle: 0,
    infinite: 0,
    users: 0,
  });
  const [portalEchoes, setPortalEchoes] = useState<any[]>([]);
  const [circleEchoes, setCircleEchoes] = useState<any[]>([]);
  const [infiniteEchoes, setInfiniteEchoes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [uploadingEcho, setUploadingEcho] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setIsAuthenticated(true);
        loadDashboard();
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("success", "Login successful!");
    } catch (error: any) {
      showMessage("error", "Login failed: " + error.message);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      showMessage("success", "Logged out successfully");
    } catch (error: any) {
      showMessage("error", "Logout failed: " + error.message);
    }
  }

  async function loadDashboard() {
    await Promise.all([
      loadStats(),
      loadEchoes("portal", 800, setPortalEchoes),
      loadEchoes("circle", 80, setCircleEchoes),
      loadEchoes("infinite", 8, setInfiniteEchoes),
      loadUsers(),
    ]);
  }

  async function loadStats() {
    try {
      const collections = ["portal", "circle", "infinite"];
      const newStats: any = {};

      for (const coll of collections) {
        const snapshot = await getDocs(collection(db, coll));
        let unlocked = 0;
        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          if (doc.data().unlocked) unlocked++;
        });
        newStats[coll] = unlocked;
      }

      const usersSnapshot = await getDocs(collection(db, "users"));
      newStats.users = usersSnapshot.size;

      setStats(newStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function loadEchoes(type: string, count: number, setter: Function) {
    try {
      const snapshot = await getDocs(collection(db, type));
      const data: any = {};
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        data[doc.id] = doc.data();
      });

      const echoes = [];
      for (let i = 1; i <= count; i++) {
        echoes.push({
          id: i,
          unlocked: data[i]?.unlocked || false,
        });
      }
      setter(echoes);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    }
  }

  async function loadUsers() {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData: any[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  async function handleImageUpload(echoNumber: number) {
    if (!uploadFile) {
      showMessage("error", "Please select a file first");
      return;
    }

    try {
      setUploadingEcho(echoNumber);
      
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("echoNumber", echoNumber.toString());

      // Upload to S3
      const response = await fetch("/api/echoes/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Save reference to Firestore
      await setDoc(doc(db, "echoImages", String(echoNumber)), {
        echoNumber,
        cloudStoragePath: data.cloudStoragePath,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      showMessage("success", `Image uploaded for Echo ${echoNumber}!`);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      showMessage("error", "Upload failed: " + error.message);
    } finally {
      setUploadingEcho(null);
    }
  }

  async function toggleEcho(type: string, id: number, unlock: boolean) {
    try {
      await setDoc(
        doc(db, type, String(id)),
        {
          unlocked: unlock,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      await loadEchoes(
        type,
        type === "portal" ? 800 : type === "circle" ? 80 : 8,
        type === "portal" ? setPortalEchoes : type === "circle" ? setCircleEchoes : setInfiniteEchoes
      );
      await loadStats();
      showMessage("success", `${type} Echo ${id} ${unlock ? "unlocked" : "locked"}!`);
    } catch (error: any) {
      showMessage("error", "Error updating: " + error.message);
    }
  }

  async function unlockBulk(type: string, count: number) {
    if (!confirm(`Unlock next ${count} ${type} echoes?`)) return;

    try {
      const echoes = type === "portal" ? portalEchoes : type === "circle" ? circleEchoes : infiniteEchoes;
      const batch = writeBatch(db);
      let unlocked = 0;

      for (const echo of echoes) {
        if (!echo.unlocked && unlocked < count) {
          const docRef = doc(db, type, String(echo.id));
          batch.set(
            docRef,
            {
              unlocked: true,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );
          unlocked++;
        }
      }

      await batch.commit();
      await loadEchoes(
        type,
        type === "portal" ? 800 : type === "circle" ? 80 : 8,
        type === "portal" ? setPortalEchoes : type === "circle" ? setCircleEchoes : setInfiniteEchoes
      );
      await loadStats();
      showMessage("success", `Unlocked ${unlocked} ${type} echoes!`);
    } catch (error: any) {
      showMessage("error", "Error unlocking: " + error.message);
    }
  }

  async function lockAll(type: string) {
    if (!confirm(`Lock all ${type} echoes?`)) return;

    try {
      const maxCount = type === "portal" ? 800 : type === "circle" ? 80 : 8;
      const batch = writeBatch(db);

      for (let i = 1; i <= maxCount; i++) {
        const docRef = doc(db, type, String(i));
        batch.set(
          docRef,
          {
            unlocked: false,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      await batch.commit();
      await loadEchoes(
        type,
        maxCount,
        type === "portal" ? setPortalEchoes : type === "circle" ? setCircleEchoes : setInfiniteEchoes
      );
      await loadStats();
      showMessage("success", `All ${type} echoes locked!`);
    } catch (error: any) {
      showMessage("error", "Error locking: " + error.message);
    }
  }

  async function initializeDatabase() {
    if (!confirm("⚠️ This will initialize/reset all Firestore collections. Continue?")) return;

    try {
      showMessage("success", "Initializing database... Please wait.");

      // Initialize Portal (800)
      const portalBatch = writeBatch(db);
      for (let i = 1; i <= 800; i++) {
        const docRef = doc(db, "portal", String(i));
        portalBatch.set(docRef, {
          id: i,
          unlocked: i <= 111,
          createdAt: Timestamp.now(),
        });
      }
      await portalBatch.commit();

      // Initialize Circle (80)
      const circleBatch = writeBatch(db);
      for (let i = 1; i <= 80; i++) {
        const docRef = doc(db, "circle", String(i));
        circleBatch.set(docRef, {
          id: i,
          unlocked: false,
          createdAt: Timestamp.now(),
        });
      }
      await circleBatch.commit();

      // Initialize Infinite (8)
      const infiniteBatch = writeBatch(db);
      for (let i = 1; i <= 8; i++) {
        const docRef = doc(db, "infinite", String(i));
        infiniteBatch.set(docRef, {
          id: i,
          unlocked: false,
          createdAt: Timestamp.now(),
        });
      }
      await infiniteBatch.commit();

      // Initialize Settings
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);

      await setDoc(doc(db, "settings", "portal"), {
        nextUnlock: Timestamp.fromDate(nextWeek),
        updatedAt: Timestamp.now(),
      });

      await setDoc(doc(db, "settings", "circle"), {
        nextUnlock: Timestamp.fromDate(nextWeek),
        updatedAt: Timestamp.now(),
      });

      await setDoc(doc(db, "settings", "infinite"), {
        nextUnlock: Timestamp.fromDate(nextWeek),
        updatedAt: Timestamp.now(),
      });

      await setDoc(doc(db, "settings", "global"), {
        portalInterval: 8,
        portalBatchSize: 111,
        updatedAt: Timestamp.now(),
      });

      showMessage("success", "✅ Database initialized! Reloading...");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      showMessage("error", "Error initializing: " + error.message);
    }
  }

  function showMessage(type: string, text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-[#00ccff] text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] p-8 rounded-2xl border-2 border-[#00ccff] shadow-[0_0_30px_rgba(0,204,255,0.3)]">
          <h2 className="text-3xl font-bold text-[#00ccff] text-center mb-6 drop-shadow-[0_0_20px_#00ccff]">
            🔮 Numb8 Admin Login
          </h2>
          {message.type === "error" && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">{message.text}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[#a55cff] mb-2 text-sm">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-[#1e1e3f] border-2 border-[#a55cff] rounded-lg text-white focus:outline-none focus:border-[#00ccff]"
                placeholder="admin@numb8.com"
                required
              />
            </div>
            <div>
              <label className="block text-[#a55cff] mb-2 text-sm">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#1e1e3f] border-2 border-[#a55cff] rounded-lg text-white focus:outline-none focus:border-[#00ccff]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00ccff] to-[#a55cff] text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] p-6 rounded-2xl border-2 border-[#00ccff] shadow-[0_0_30px_rgba(0,204,255,0.3)] mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#00ccff] drop-shadow-[0_0_20px_#00ccff]">
                🔮 Numb8 Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-1">Control Panel for Portal (800), Circle (80) & Infinite (8)</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {message.text}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1e1e3f] to-[#2a2a4a] p-6 rounded-xl border-2 border-[#a55cff] text-center hover:translate-y-[-5px] transition-transform">
            <h3 className="text-[#a55cff] text-sm mb-2">Portal Unlocked</h3>
            <div className="text-4xl font-bold text-[#00ccff] drop-shadow-[0_0_15px_#00ccff]">
              {stats.portal}
            </div>
            <p className="text-gray-400 mt-1">/ 800</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1e3f] to-[#2a2a4a] p-6 rounded-xl border-2 border-[#a55cff] text-center hover:translate-y-[-5px] transition-transform">
            <h3 className="text-[#a55cff] text-sm mb-2">Circle Unlocked</h3>
            <div className="text-4xl font-bold text-[#00ccff] drop-shadow-[0_0_15px_#00ccff]">
              {stats.circle}
            </div>
            <p className="text-gray-400 mt-1">/ 80</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1e3f] to-[#2a2a4a] p-6 rounded-xl border-2 border-[#a55cff] text-center hover:translate-y-[-5px] transition-transform">
            <h3 className="text-[#a55cff] text-sm mb-2">Infinite Unlocked</h3>
            <div className="text-4xl font-bold text-[#00ccff] drop-shadow-[0_0_15px_#00ccff]">
              {stats.infinite}
            </div>
            <p className="text-gray-400 mt-1">/ 8</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1e3f] to-[#2a2a4a] p-6 rounded-xl border-2 border-[#a55cff] text-center hover:translate-y-[-5px] transition-transform">
            <h3 className="text-[#a55cff] text-sm mb-2">Total Users</h3>
            <div className="text-4xl font-bold text-[#00ccff] drop-shadow-[0_0_15px_#00ccff]">
              {stats.users}
            </div>
            <p className="text-gray-400 mt-1">Registered</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] p-6 rounded-2xl border-2 border-[#00ccff]">
          <h2 className="text-2xl font-bold text-[#00ccff] mb-6 drop-shadow-[0_0_10px_#00ccff]">
            ⚙️ Control Panel
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["portal", "circle", "infinite", "images", "users", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#00ccff] text-[#0a0a1a] shadow-[0_0_20px_#00ccff]"
                    : "bg-[#2a2a4a] text-white border-2 border-[#00ccff] hover:bg-[#00ccff] hover:text-[#0a0a1a]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Portal Tab */}
          {activeTab === "portal" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">The Portal - 800 Echoes</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => unlockBulk("portal", 111)}
                  className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Unlock Next 111
                </button>
                <button
                  onClick={() => unlockBulk("portal", 800)}
                  className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Unlock All 800
                </button>
                <button
                  onClick={() => lockAll("portal")}
                  className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Lock All
                </button>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-2 max-h-96 overflow-y-auto bg-[#1e1e3f] p-4 rounded-lg">
                {portalEchoes.map((echo) => (
                  <button
                    key={echo.id}
                    onClick={() => toggleEcho("portal", echo.id, !echo.unlocked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all hover:scale-110 hover:shadow-lg ${
                      echo.unlocked
                        ? "bg-green-500 border-green-400 text-black"
                        : "bg-gray-700 border-gray-600 text-gray-400"
                    }`}
                  >
                    {echo.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Circle Tab */}
          {activeTab === "circle" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">The Circle - 80 Echoes</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => unlockBulk("circle", 10)}
                  className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Unlock Next 10
                </button>
                <button
                  onClick={() => unlockBulk("circle", 80)}
                  className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Unlock All 80
                </button>
                <button
                  onClick={() => lockAll("circle")}
                  className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Lock All
                </button>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-96 overflow-y-auto bg-[#1e1e3f] p-4 rounded-lg">
                {circleEchoes.map((echo) => (
                  <button
                    key={echo.id}
                    onClick={() => toggleEcho("circle", echo.id, !echo.unlocked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all hover:scale-110 hover:shadow-lg ${
                      echo.unlocked
                        ? "bg-green-500 border-green-400 text-black"
                        : "bg-gray-700 border-gray-600 text-gray-400"
                    }`}
                  >
                    {echo.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Infinite Tab */}
          {activeTab === "infinite" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">The Infinite - 8 Sacred Echoes</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => unlockBulk("infinite", 8)}
                  className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Unlock All 8
                </button>
                <button
                  onClick={() => lockAll("infinite")}
                  className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Lock All
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 bg-[#1e1e3f] p-4 rounded-lg">
                {infiniteEchoes.map((echo) => (
                  <button
                    key={echo.id}
                    onClick={() => toggleEcho("infinite", echo.id, !echo.unlocked)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all hover:scale-110 hover:shadow-lg ${
                      echo.unlocked
                        ? "bg-green-500 border-green-400 text-black"
                        : "bg-gray-700 border-gray-600 text-gray-400"
                    }`}
                  >
                    {echo.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">Upload Echo Images</h3>
              
              <div className="bg-[#1e1e3f] p-6 rounded-lg mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#a55cff] mb-2">Select Image:</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full p-3 bg-[#2a2a4a] border-2 border-[#a55cff] rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#a55cff] mb-2">Echo Number (1-888):</label>
                    <input
                      type="number"
                      min="1"
                      max="888"
                      id="echoNumberInput"
                      placeholder="Enter Echo number"
                      className="w-full max-w-md p-3 bg-[#2a2a4a] border-2 border-[#a55cff] rounded-lg text-white"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      const input = document.getElementById("echoNumberInput") as HTMLInputElement;
                      const echoNum = parseInt(input.value);
                      if (echoNum >= 1 && echoNum <= 888) {
                        handleImageUpload(echoNum);
                      } else {
                        showMessage("error", "Please enter a valid Echo number (1-888)");
                      }
                    }}
                    disabled={!uploadFile || uploadingEcho !== null}
                    className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingEcho ? `Uploading Echo ${uploadingEcho}...` : "Upload Image"}
                  </button>
                </div>
              </div>

              <div className="bg-[#1e1e3f] p-6 rounded-lg">
                <h4 className="text-[#00ccff] mb-3">Instructions:</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Select an image file (JPG, PNG, WebP, etc.)</li>
                  <li>• Enter the Echo number you want to upload the image for</li>
                  <li>• Click Upload Image - it will be optimized and stored</li>
                  <li>• The image will appear on the Echo page at /echo/[number]</li>
                  <li>• Each Echo (1-888) can have one unique image</li>
                </ul>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">Users Management</h3>
              <div className="bg-[#1e1e3f] p-4 rounded-lg max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-400">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-[#2a2a4a] p-4 rounded-lg border border-[#a55cff]"
                      >
                        <div className="text-[#00ccff] font-bold">{user.email || user.id}</div>
                        <div className="text-gray-400 text-sm">
                          Created: {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h3 className="text-xl text-[#a55cff] mb-4">Global Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#a55cff] mb-2">Portal Auto-Unlock Interval (days):</label>
                  <input
                    type="number"
                    defaultValue={8}
                    className="w-full max-w-md p-3 bg-[#1e1e3f] border-2 border-[#a55cff] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#a55cff] mb-2">Portal Unlock Batch Size:</label>
                  <input
                    type="number"
                    defaultValue={111}
                    className="w-full max-w-md p-3 bg-[#1e1e3f] border-2 border-[#a55cff] rounded-lg text-white"
                  />
                </div>
                <hr className="border-gray-700 my-6" />
                <div>
                  <h3 className="text-xl text-[#a55cff] mb-2">Initialize Database</h3>
                  <p className="text-red-500 mb-4">⚠️ Warning: This will reset all data!</p>
                  <button
                    onClick={initializeDatabase}
                    className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
                  >
                    Initialize Firestore Collections
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
