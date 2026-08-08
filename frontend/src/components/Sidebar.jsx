import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_email");

    navigate("/login");
  };

  const links = [
    {
      path: "/dashboard",
      icon: "🏠",
      label: "Dashboard",
    },
    {
      path: "/tickets",
      icon: "🎫",
      label: "Support Tickets",
    },
    {
      path: "/transactions",
      icon: "💳",
      label: "Transactions",
    },
    {
      path: "/analysis",
      icon: "🤖",
      label: "AI Analysis",
    },
    {
      path: "/risk",
      icon: "🛡️",
      label: "Risk & Fraud",
    },
    {
      path: "/approvals",
      icon: "👤",
      label: "Approvals",
    },
    {
      path: "/audit",
      icon: "📋",
      label: "Audit Trail",
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <div className="logo-icon">
          AI
        </div>

        <div>
          <h2>
            Financial AI
          </h2>

          <span>
            Operations Platform
          </span>
        </div>

      </div>


      <nav className="sidebar-nav">

        <p className="nav-title">
          MAIN MENU
        </p>

        {links.map((link) => (

          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "active" : ""
              }`
            }
          >

            <span className="nav-icon">
              {link.icon}
            </span>

            <span>
              {link.label}
            </span>

          </NavLink>

        ))}

      </nav>


      <div className="sidebar-footer">

        <div className="system-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              Backend Connected
            </strong>

            <small>
              API: 127.0.0.1:8000
            </small>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            width: "100%",
            marginTop: "15px",
          }}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;