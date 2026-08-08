import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  const email =
    localStorage.getItem("user_email") ||
    "User";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_email");

    window.location.href = "/login";
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-area">

        <header className="topbar">

          <div>
            <h1>
              Agentic Financial Assistant
            </h1>

            <p>
              AI-powered financial operations
            </p>
          </div>

          <div className="topbar-actions">

            <div className="topbar-status">
              <span className="status-dot"></span>
              System Online
            </div>

            <span>
              {email}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>

        <div className="page-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default Layout;