// src/Editor.jsx
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function Editor() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState(articleId || "");
  const [content, setContent] = useState("");

  // Wikipedia-style toolbox configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ script: "super" }, { script: "sub" }], // For citations!
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"], // Internal links can just be relative URLs like /article/Name
      ["clean"],
    ],
  };

  useEffect(() => {
    async function fetchArticle() {
      if (articleId) {
        const docRef = doc(db, "articles", articleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
        }
      }
    }
    fetchArticle();
  }, [articleId]);

  const saveArticle = async () => {
    // Save to Firebase Firestore
    const docRef = doc(
      db,
      "articles",
      title.toLowerCase().replace(/\s+/g, "-"),
    );
    await setDoc(docRef, {
      title: title,
      content: content,
      lastEdited: new Date(),
    });
    navigate(`/article/${title.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>{articleId ? "Edit Article" : "Create New Article"}</h1>
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
        style={{ padding: "10px 20px", fontSize: "1.1rem" }}
      >
        Publish Article
      </button>
    </div>
  );
}
