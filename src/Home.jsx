// src/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
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
          🍷
          <br />
          <b>Vinopedia</b>
        </div>
        <ul>
          <li>
            <Link to="/">Main page</Link>
          </li>
          <li>
            <Link to="/article/Internet-Meme">Random article</Link>
          </li>
        </ul>
        <hr
          style={{
            border: "0",
            borderTop: "1px solid #a2a9b1",
            margin: "10px 0",
          }}
        />
        <ul>
          <li>
            <Link to="/create">Create new article</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="wiki-main-wrapper">
        <div className="wiki-tabs">
          <div className="wiki-tab active">Main Page</div>
        </div>

        <div className="wiki-content-box">
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #a2a9b1",
              padding: "20px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{
                margin: "0 0 10px 0",
                fontFamily: "serif",
                fontSize: "2.5rem",
              }}
            >
              Welcome to Vinopedia,
            </h1>
            <p style={{ margin: 0, fontSize: "1.2rem" }}>
              the free encyclopedia that anyone can mock up.
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  borderBottom: "1px solid #a2a9b1",
                  backgroundColor: "#cef2e0",
                  padding: "5px 10px",
                  marginTop: 0,
                }}
              >
                From today's featured article
              </h2>
              <p>
                Check out our heavily researched placeholder article. It
                features a completely functioning infobox, a table of contents,
                and dummy references so you can see exactly how the Wikipedia
                layout works.
              </p>
              <p>
                <b>
                  👉{" "}
                  <Link to="/article/Internet-Meme">
                    Click here to view the Placeholder Article
                  </Link>
                </b>
              </p>
              <p>
                Once you are there, click the <b>Edit</b> tab at the top to see
                how the visual toolbox formats everything!
              </p>
            </div>

            <div style={{ width: "300px" }}>
              <h2
                style={{
                  borderBottom: "1px solid #a2a9b1",
                  backgroundColor: "#e8f2f8",
                  padding: "5px 10px",
                  marginTop: 0,
                }}
              >
                Search
              </h2>
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #a2a9b1",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <input
                  type="text"
                  placeholder="Search Vinopedia"
                  style={{
                    width: "100%",
                    padding: "5px",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                  <Link to="/article/Internet-Meme" style={{ flex: 1 }}>
                    <button style={{ width: "100%" }}>Search</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
