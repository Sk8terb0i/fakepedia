// src/Article.jsx
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

export default function Article() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);

  const placeholder = {
    title: "Internet Meme",
    content: `
      <table class="wiki-infobox">
        <tbody>
          <tr><th colspan="2" class="wiki-infobox-title">Internet Meme</th></tr>
          <tr><th>Also known as</th><td>Dank Memes, Brain Rot</td></tr>
          <tr><th>Medium</th><td>Images, Videos, Text</td></tr>
        </tbody>
      </table>
      <p>An <strong>Internet meme</strong> is a cultural item that is spread via the internet and often altered in a creative or humorous way.</p>
      <div class="wiki-toc">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">Contents</div>
        <ul><li><a href="#History">1 History</a></li></ul>
      </div>
      <h2>History</h2>
      <p>The concept was first proposed by Richard Dawkins in 1976.</p>
    `,
  };

  useEffect(() => {
    async function fetchArticle() {
      const docRef = doc(db, "articles", articleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle(docSnap.data());
      } else {
        setArticle({ ...placeholder, title: articleId.replace(/-/g, " ") });
      }
    }
    fetchArticle();
  }, [articleId]);

  if (!article) return <div>Loading...</div>;

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
          <li>
            <Link to={`/article/${articleId}`}>Random article</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="wiki-main-wrapper">
        {/* Wikipedia Tabs */}
        <div className="wiki-tabs">
          <div className="wiki-tab active">Article</div>
          <Link to={`/edit/${articleId}`} className="wiki-tab">
            Edit
          </Link>
        </div>

        <div className="wiki-content-box">
          <h1 className="wiki-title">{article.title}</h1>
          <div
            className="wiki-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </div>
  );
}
