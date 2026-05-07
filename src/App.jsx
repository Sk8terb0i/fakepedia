// src/App.jsx
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Article from "./Article";
import Editor from "./Editor";

export default function App() {
  return (
    // We use HashRouter because GitHub pages doesn't support browser routing out of the box
    <Router>
      <Routes>
        {/* Redirect root to our placeholder article */}
        <Route path="/" element={<Navigate to="/article/main-page" />} />
        <Route path="/article/:articleId" element={<Article />} />
        <Route path="/create" element={<Editor />} />
        <Route path="/edit/:articleId" element={<Editor />} />
      </Routes>
    </Router>
  );
}
