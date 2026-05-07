import { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { db, auth, storage } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useParams, useNavigate, Link } from "react-router-dom";

// Copying the exact same processor for the Live Preview
const processWikiHTML = (rawHtml) => {
  if (!rawHtml) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  doc.querySelectorAll(".wiki-toc").forEach((el) => el.remove());
  const headers = doc.querySelectorAll("h2");
  if (headers.length > 0) {
    const tocDiv = doc.createElement("div");
    tocDiv.className = "wiki-toc";
    tocDiv.innerHTML =
      '<div style="font-weight: bold; text-align: center; margin-bottom: 10px;">Contents</div>';
    const ul = doc.createElement("ul");
    headers.forEach((h2, index) => {
      const id =
        h2.textContent.trim().replace(/[^a-zA-Z0-9]/g, "_") || `sec-${index}`;
      h2.id = id;
      const li = doc.createElement("li");
      li.innerHTML = `<a href="#${id}" onclick="document.getElementById('${id}').scrollIntoView({behavior:'smooth'}); return false;">${index + 1} ${h2.textContent}</a>`;
      ul.appendChild(li);
    });
    tocDiv.appendChild(ul);
    headers[0].parentNode.insertBefore(tocDiv, headers[0]);
  }
  return doc.body.innerHTML;
};

export default function Editor() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState(
    articleId ? articleId.replace(/-/g, " ") : "",
  );
  const [content, setContent] = useState("");
  const [sources, setSources] = useState([]);
  const sourcesRef = useRef([]);

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const quillRef = useRef(null);
  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  // NEW BASE TEMPLATE: Includes the image and removes the hardcoded TOC!
  const baseTemplate = `
    <table>
      <tbody>
        <tr><th colspan="2" class="wiki-infobox-title">Article Title</th></tr>
        <tr><td colspan="2" style="text-align: center; background: white;"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/220px-Wikipedia-logo-v2.svg.png" style="max-width: 100%; height: auto;" alt="placeholder image"/></td></tr>
        <tr><th>Also known as</th><td>Alternative names</td></tr>
        <tr><th>Medium</th><td>Images, Videos, Text</td></tr>
      </tbody>
    </table>
    <p><strong>Article Name</strong> is a...</p>
    <h2>History</h2>
    <p>Early beginnings...</p>
  `;

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
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
          setSources(docSnap.data().sources || []);
        } else {
          setContent(baseTemplate);
        }
      } else {
        setContent(baseTemplate);
      }
    }
    fetchArticle();
  }, [articleId]);

  const saveArticle = async () => {
    if (!title.trim()) return alert("Please enter a title!");
    const urlSlug = title.toLowerCase().replace(/\s+/g, "-");
    const docRef = doc(db, "articles", urlSlug);
    await setDoc(docRef, { title, content, sources, lastEdited: new Date() });
    navigate(`/article/${urlSlug}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await signInWithEmailAndPassword(auth, email, password).catch((err) =>
      alert(err.message),
    );
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const storageRef = ref(
            storage,
            `article_images/${Date.now()}-${file.name}`,
          );
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", downloadURL);
        } catch (error) {
          alert("Image upload failed.");
        }
      }
    };
  };

  const citeHandler = () => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    const sourceText = prompt("Enter source description/URL:");
    if (sourceText) {
      const currentSources = sourcesRef.current;
      const citeCount = currentSources.length + 1;
      setSources([...currentSources, sourceText]);
      quill.insertText(range.index, `[${citeCount}]`, {
        link: `#cite_note-${citeCount}`,
        script: "super",
      });
      quill.setSelection(range.index + 3);
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ script: "super" }, { script: "sub" }],
          ["link", "image", "clean"],
          ["cite"],
        ],
        handlers: { image: imageHandler, cite: citeHandler },
      },
    }),
    [],
  );

  if (!user)
    return /* ... Keep existing Login UI ... */ <div>Log in required</div>;

  return (
    <div
      className="wiki-layout"
      style={{ maxWidth: "100%", padding: "0 20px" }}
    >
      <div className="wiki-sidebar">
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "2rem",
          }}
        >
          🍷
          <br />
          <b>Vinopedia</b>
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

      <div
        className="wiki-main-wrapper"
        style={{ display: "flex", gap: "20px", maxWidth: "calc(100% - 180px)" }}
      >
        {/* LEFT SIDE: Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="wiki-tabs">
            <div className="wiki-tab active">Edit Mode</div>
          </div>

          <div
            className="wiki-content-box"
            style={{ padding: "20px", marginBottom: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Title"
                style={{ width: "60%", padding: "10px" }}
              />
              <button
                onClick={saveArticle}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0645ad",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Publish
              </button>
            </div>

            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{
                height: "40vh",
                overflowY: "auto",
                marginBottom: "40px",
              }}
            />

            <div style={{ borderTop: "2px solid #a2a9b1", paddingTop: "10px" }}>
              <h3 style={{ marginTop: 0 }}>Sources Manager</h3>
              {sources.length === 0 ? (
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  Click the <b>[Cite]</b> button in the toolbar to add a source.
                </p>
              ) : (
                <ol
                  style={{
                    fontSize: "0.9rem",
                    backgroundColor: "#f8f9fa",
                    padding: "10px 30px",
                    border: "1px solid #ccc",
                  }}
                >
                  {sources.map((src, idx) => (
                    <li key={idx} style={{ marginBottom: "5px" }}>
                      {src}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Live Preview (Passed through the processor!) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="wiki-tabs">
            <div
              className="wiki-tab active"
              style={{ backgroundColor: "#eaf3ff" }}
            >
              Live Preview
            </div>
          </div>
          <div
            className="wiki-content-box"
            style={{
              flexGrow: 1,
              padding: "30px",
              overflowY: "auto",
              maxHeight: "85vh",
              backgroundColor: "#fcfcfc",
              border: "1px dashed #a2a9b1",
            }}
          >
            <h1 className="wiki-title">{title || "Untitled Article"}</h1>

            {/* The Live Content is processed to generate the TOC! */}
            <div
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: processWikiHTML(content) }}
            />

            {sources.length > 0 && (
              <div className="wiki-content">
                <h2>References</h2>
                <div
                  style={{
                    borderTop: "1px solid #a2a9b1",
                    paddingTop: "10px",
                    fontSize: "90%",
                  }}
                >
                  <ol>
                    {sources.map((src, idx) => (
                      <li id={`cite_note-${idx + 1}`} key={idx}>
                        <b>^</b> {src}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
