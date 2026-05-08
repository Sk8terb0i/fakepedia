import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

// --- THE UPGRADED MAGIC HTML PROCESSOR ---
const processWikiHTML = (rawHtml, mainImageUrl = null) => {
  if (!rawHtml) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  // 1. Auto-Generate the TOC
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

  // 2. Fix Citation Links
  const citations = doc.querySelectorAll("sup a");
  citations.forEach((cite) => {
    const targetId = cite.getAttribute("href").replace("#", "");
    cite.setAttribute(
      "onclick",
      `document.getElementById('${targetId}').scrollIntoView({behavior:'smooth'}); return false;`,
    );
  });

  // 3. INJECT THE MAIN IMAGE INTO THE INFOBOX
  if (mainImageUrl) {
    // Find the first table (the Infobox)
    const infoboxBody = doc.querySelector("table tbody");
    if (infoboxBody) {
      const imgRow = doc.createElement("tr");
      imgRow.innerHTML = `<td colspan="2" style="text-align: center; background: white; padding: 10px;"><img src="${mainImageUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" alt="Infobox Image"/></td>`;

      // Insert it right after the first row (which is the title)
      const firstRow = infoboxBody.querySelector("tr");
      if (firstRow) {
        firstRow.parentNode.insertBefore(imgRow, firstRow.nextSibling);
      } else {
        infoboxBody.prepend(imgRow);
      }
    }
  }

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
              __html: processWikiHTML(article.content, article.mainImage),
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
