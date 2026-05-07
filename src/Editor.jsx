// src/Editor.jsx
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db, auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ script: "super" }, { script: "sub" }],
      ["link", "image", "clean"],
    ],
  };

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

  // If not logged in, show the Email/Password Bouncer
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

  // The Editor Layout
  return (
    <div className="wiki-layout">
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
          <li style={{ color: "#54595d" }}>
            Logged in as:
            <br />
            {user.email}
          </li>
          <li>
            <a href="#" onClick={() => signOut(auth)}>
              Log out
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="wiki-main-wrapper">
        <div className="wiki-tabs">
          {articleId && (
            <Link to={`/article/${articleId}`} className="wiki-tab">
              Read
            </Link>
          )}
          <div className="wiki-tab active">Edit</div>
        </div>

        <div className="wiki-content-box">
          <h1 className="wiki-title">Editing {title || "New Article"}</h1>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              fontSize: "1.2rem",
              boxSizing: "border-box",
            }}
          />
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ height: "400px", marginBottom: "50px" }}
          />
          <button
            onClick={saveArticle}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0645ad",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            Publish changes
          </button>
        </div>
      </div>
    </div>
  );
}
