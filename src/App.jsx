// src/App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Article from "./Article";
import Editor from "./Editor";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* The root path now loads the landing page with the search bar */}
        <Route path="/" element={<Home />} />
        <Route path="/article/:articleId" element={<Article />} />
        <Route path="/create" element={<Editor />} />
        <Route path="/edit/:articleId" element={<Editor />} />
      </Routes>
    </Router>
  );
}
