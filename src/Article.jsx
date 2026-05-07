// src/Article.jsx
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

export default function Article() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);

  // The Placeholder Parody Article
  const placeholder = {
    title: "Uncyclopedia (Placeholder)",
    content: `
      <p><strong>Uncyclopedia</strong> is a parody of Wikipedia. According to top researchers<sup>[1]</sup>, it is entirely made up.</p>
      <h2>History</h2>
      <p>It was created in a basement in 2026.</p>
      <hr/>
      <h3>Sources</h3>
      <ol>
        <li><a href="https://google.com" target="_blank">Dr. Fake Name's Journal of Nonsense</a></li>
      </ol>
    `,
  };

  useEffect(() => {
    async function fetchArticle() {
      const docRef = doc(db, "articles", articleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle(docSnap.data());
      } else {
        setArticle(placeholder); // Fallback to placeholder if it doesn't exist
      }
    }
    fetchArticle();
  }, [articleId]);

  if (!article) return <div>Loading...</div>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>{article.title}</h1>
        <Link to={`/edit/${articleId}`}>
          <button style={{ padding: "5px 15px" }}>Edit this page</button>
        </Link>
      </div>

      {/* Dangerously Set Inner HTML is used here to render the HTML output from React-Quill safely */}
      <div
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
