import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // ==============================
  // LOAD TICKETS
  // ==============================

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/support/tickets`
      );

      console.log("Tickets:", response.data);

      setTickets(response.data);

    } catch (err) {
      console.error("Ticket loading error:", err);

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to load support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // ==============================
  // AI ANALYSIS
  // ==============================

  const analyzeTicket = async (ticketId) => {
    try {
      setMessage(
        `Analyzing ${ticketId} using AI agents...`
      );

      const response = await axios.post(
        `${API}/agent/process/${ticketId}`
      );

      console.log(
        "AI Analysis:",
        response.data
      );

      sessionStorage.setItem(
        "latestAnalysis",
        JSON.stringify(response.data)
      );

      setMessage(
        `AI analysis completed for ${ticketId}`
      );

      navigate(
        `/analysis?ticket=${ticketId}`
      );

    } catch (err) {
      console.error(
        "AI analysis error:",
        err
      );

      setMessage(
        err.response?.data?.detail ||
        err.message ||
        "AI analysis failed"
      );
    }
  };

  // ==============================
  // PRIORITY CLASS
  // ==============================

  const getPriorityClass = (priority) => {
    const value =
      priority?.toUpperCase();

    if (value === "CRITICAL") {
      return "badge critical";
    }

    if (value === "HIGH") {
      return "badge high";
    }

    if (value === "MEDIUM") {
      return "badge medium";
    }

    return "badge low";
  };

  // ==============================
  // STATUS CLASS
  // ==============================

  const getStatusClass = (status) => {
    const value =
      status?.toUpperCase();

    if (value === "OPEN") {
      return "badge open";
    }

    if (value === "CLOSED") {
      return "badge approved";
    }

    return "badge";
  };

  // ==============================
  // STATISTICS
  // ==============================

  const totalTickets = tickets.length;

  const criticalTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority?.toUpperCase() ===
        "CRITICAL"
    ).length;

  const highTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority?.toUpperCase() ===
        "HIGH"
    ).length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status?.toUpperCase() ===
        "OPEN"
    ).length;

  // ==============================
  // UI
  // ==============================

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-toolbar">

        <div>
          <h2>
            Customer Support Tickets
          </h2>

          <p>
            View, investigate and analyze
            customer financial support cases.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadTickets}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="message">
          <span>{message}</span>

          <button
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="error-message">

          <strong>
            Unable to load support tickets
          </strong>

          <p>
            {error}
          </p>

          <button
            className="secondary-btn"
            onClick={loadTickets}
          >
            Try Again
          </button>

        </div>
      )}


      {/* STATISTICS */}

      <div className="stats-grid">

        <div className="stat-card blue">

          <span>🎫</span>

          <p>
            Total Tickets
          </p>

          <strong>
            {totalTickets}
          </strong>

          <small>
            All support cases
          </small>

        </div>


        <div className="stat-card red">

          <span>🔴</span>

          <p>
            Critical
          </p>

          <strong>
            {criticalTickets}
          </strong>

          <small>
            Immediate attention
          </small>

        </div>


        <div className="stat-card orange">

          <span>🟠</span>

          <p>
            High Priority
          </p>

          <strong>
            {highTickets}
          </strong>

          <small>
            High priority cases
          </small>

        </div>


        <div className="stat-card green">

          <span>🟢</span>

          <p>
            Open Cases
          </p>

          <strong>
            {openTickets}
          </strong>

          <small>
            Active cases
          </small>

        </div>

      </div>


      {/* TICKET REGISTRY */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              All Support Tickets
            </h2>

            <p>
              AI-powered ticket investigation
            </p>

          </div>

          <span>
            {tickets.length} records
          </span>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <div className="loading-spinner">
              ⏳
            </div>

            <p>
              Loading support tickets...
            </p>

          </div>

        ) : error ? (

          <div className="empty-state">

            <p>
              Could not load ticket records.
            </p>

            <button
              className="primary-btn"
              onClick={loadTickets}
            >
              Retry
            </button>

          </div>

        ) : tickets.length === 0 ? (

          <div className="empty-state">

            <h3>
              No support tickets found
            </h3>

            <p>
              There are currently no support
              cases in the system.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Transaction</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {tickets.map(
                  (ticket) => (

                    <tr
                      key={
                        ticket.id ||
                        ticket.ticket_id
                      }
                    >

                      <td>

                        <strong>
                          {ticket.ticket_id}
                        </strong>

                      </td>


                      <td>
                        {ticket.customer_id}
                      </td>


                      <td>

                        <div className="ticket-subject">

                          <strong>
                            {ticket.subject}
                          </strong>

                          {ticket.description && (
                            <small>
                              {
                                ticket.description
                              }
                            </small>
                          )}

                        </div>

                      </td>


                      <td>

                        <span
                          className={getPriorityClass(
                            ticket.priority
                          )}
                        >
                          {ticket.priority ||
                            "LOW"}
                        </span>

                      </td>


                      <td>

                        <span
                          className={getStatusClass(
                            ticket.status
                          )}
                        >
                          {ticket.status ||
                            "OPEN"}
                        </span>

                      </td>


                      <td>

                        {ticket.transaction_id ||
                          "N/A"}

                      </td>


                      <td>

                        <button
                          className="analyze-btn"
                          onClick={() =>
                            analyzeTicket(
                              ticket.ticket_id
                            )
                          }
                        >
                          🤖 Analyze
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Tickets;