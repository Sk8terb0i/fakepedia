// src/Editor.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { db, auth, storage } from "./firebase"; // Import storage
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage functions
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function Editor() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState(
    articleId ? articleId.replace(/-/g, " ") : "",
  );
  const [content, setContent] = useState("");

  // Auth State
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // We need a ref to access the Quill instance directly for inserting images
  const quillRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      if (articleId) {
        const docRef = doc(db, "articles", articleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setContent(docSnap.data().content);
      }
    }
    fetchArticle();
  }, [articleId]);

  const saveArticle = async () => {
    if (!title.trim()) return alert("Please enter a title!");
    const urlSlug = title.toLowerCase().replace(/\s+/g, "-");
    const docRef = doc(db, "articles", urlSlug);
    await setDoc(docRef, { title, content, lastEdited: new Date() });
    navigate(`/article/${urlSlug}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // --- CUSTOM FIREBASE IMAGE HANDLER ---
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          // 1. Create a unique reference in Firebase Storage
          const storageRef = ref(
            storage,
            `article_images/${Date.now()}-${file.name}`,
          );

          // 2. Upload the file
          await uploadBytes(storageRef, file);

          // 3. Get the public URL
          const downloadURL = await getDownloadURL(storageRef);

          // 4. Insert the image into the editor at the current cursor position
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true); // get current cursor position
          quill.insertEmbed(range.index, "image", downloadURL);
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Image upload failed. Check console for details.");
        }
      }
    };
  };

  // useMemo is CRITICAL here so the editor doesn't re-render and lose focus on every keystroke
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ script: "super" }, { script: "sub" }],
          ["link", "image", "clean"],
        ],
        handlers: {
          image: imageHandler, // Hijack the image button
        },
      },
    }),
    [],
  );

  // --- BOUNCER: Login Screen ---
  if (!user) {
    return (
      <div className="wiki-layout">
        <div
          className="wiki-main-wrapper"
          style={{ margin: "0 auto", maxWidth: "400px", paddingTop: "100px" }}
        >
          <div className="wiki-content-box">
            <h2 className="wiki-title">Log in to Edit</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: "8px" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: "8px" }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor: "#0645ad",
                  color: "white",
                  border: "none",
                }}
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- SPLIT-PANE EDITOR LAYOUT ---
  return (
    <div
      className="wiki-layout"
      style={{ maxWidth: "100%", padding: "0 20px" }}
    >
      {/* Sidebar */}
      <div className="wiki-sidebar">
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "2rem",
          }}
        >
          🌐
          <br />
          <b>Fakepedia</b>
        </div>
        <ul>
          <li>
            <Link to="/">Main page</Link>
          </li>
        </ul>
        <hr />
        <ul>
          <li style={{ color: "#54595d" }}>{user.email}</li>
          <li>
            <a href="#" onClick={() => signOut(auth)}>
              Log out
            </a>
          </li>
        </ul>
      </div>

      {/* Main Wrapper is now a flex container for side-by-side editing */}
      <div
        className="wiki-main-wrapper"
        style={{ display: "flex", gap: "20px", maxWidth: "calc(100% - 180px)" }}
      >
        {/* LEFT SIDE: The Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="wiki-tabs">
            {articleId && (
              <Link to={`/article/${articleId}`} className="wiki-tab">
                Cancel & Read
              </Link>
            )}
            <div className="wiki-tab active">Edit Mode</div>
          </div>

          <div
            className="wiki-content-box"
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Title"
                style={{
                  width: "60%",
                  padding: "10px",
                  fontSize: "1.2rem",
                  fontFamily: "serif",
                }}
              />
              <button
                onClick={saveArticle}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0645ad",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  borderRadius: "2px",
                }}
              >
                Publish Changes
              </button>
            </div>

            <ReactQuill
              ref={quillRef} // Attach the ref here
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ flexGrow: 1, height: "60vh", overflowY: "auto" }}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Live Wikipedia Preview */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="wiki-tabs">
            <div
              className="wiki-tab active"
              style={{ backgroundColor: "#eaf3ff", color: "#000" }}
            >
              Live Preview
            </div>
          </div>
          <div
            className="wiki-content-box"
            style={{
              flexGrow: 1,
              padding: "30px 40px",
              overflowY: "auto",
              maxHeight: "75vh",
              backgroundColor: "#fcfcfc",
              border: "1px dashed #a2a9b1",
            }}
          >
            <h1 className="wiki-title">{title || "Untitled Article"}</h1>
            {/* The preview renders exactly how the real article will look */}
            <div
              className="wiki-content"
              dangerouslySetInnerHTML={{
                __html:
                  content ||
                  '<p style="color: #888;">Start typing to see the preview...</p>',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
