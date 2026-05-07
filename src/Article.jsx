import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

// --- THE MAGIC HTML PROCESSOR ---
const processWikiHTML = (rawHtml) => {
  if (!rawHtml) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  // 1. Remove any old hardcoded TOCs
  doc.querySelectorAll(".wiki-toc").forEach((el) => el.remove());

  // 2. Auto-Generate the TOC based on <h2> tags
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
      h2.id = id; // Add ID so we can scroll to it
      const li = doc.createElement("li");
      // We use onclick to scroll smoothly without breaking the HashRouter URLs
      li.innerHTML = `<a href="#${id}" onclick="document.getElementById('${id}').scrollIntoView({behavior:'smooth'}); return false;">${index + 1} ${h2.textContent}</a>`;
      ul.appendChild(li);
    });

    tocDiv.appendChild(ul);
    // Insert the TOC right before the first H2
    headers[0].parentNode.insertBefore(tocDiv, headers[0]);
  }

  // 3. Fix Citation Links for smooth scrolling
  const citations = doc.querySelectorAll("sup a");
  citations.forEach((cite) => {
    const targetId = cite.getAttribute("href").replace("#", "");
    cite.setAttribute(
      "onclick",
      `document.getElementById('${targetId}').scrollIntoView({behavior:'smooth'}); return false;`,
    );
  });

  return doc.body.innerHTML;
};

export default function Article() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      const docRef = doc(db, "articles", articleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle(docSnap.data());
      } else {
        setArticle({
          title: "Not Found",
          content: "<p>This article does not exist yet.</p>",
          sources: [],
        });
      }
    }
    fetchArticle();
  }, [articleId]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="wiki-layout">
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
      </div>

      <div className="wiki-main-wrapper">
        <div className="wiki-tabs">
          <div className="wiki-tab active">Article</div>
          <Link to={`/edit/${articleId}`} className="wiki-tab">
            Edit
          </Link>
        </div>

        <div className="wiki-content-box">
          <h1 className="wiki-title">{article.title}</h1>

          {/* We pass the content through our magic processor first! */}
          <div
            className="wiki-content"
            dangerouslySetInnerHTML={{
              __html: processWikiHTML(article.content),
            }}
          />

          {article.sources && article.sources.length > 0 && (
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
                  {article.sources.map((src, idx) => (
                    <li id={`cite_note-${idx + 1}`} key={idx}>
                      <b>^</b>{" "}
                      {src.startsWith("http") ? (
                        <a href={src} target="_blank" rel="noreferrer">
                          {src}
                        </a>
                      ) : (
                        src
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
