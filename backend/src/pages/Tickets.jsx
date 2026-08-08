import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [analyzing, setAnalyzing] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // LOAD TICKETS
  // =====================================================

  const loadTickets = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API}/support/tickets`
      );

      console.log("Tickets loaded:", response.data);

      setTickets(response.data);

    } catch (error) {
      console.error("Tickets error:", error);

      setMessage(
        error.response?.data?.detail ||
        "Unable to load support tickets"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // =====================================================
  // ANALYZE TICKET
  // =====================================================

  const analyzeTicket = async (ticketId) => {
    try {
      setAnalyzing(ticketId);
      setMessage(
        `🤖 Analyzing ${ticketId} using AI agents...`
      );

      const response = await axios.post(
        `${API}/agent/process/${ticketId}`
      );

      console.log(
        "AI Analysis Result:",
        response.data
      );

      // Save result
      sessionStorage.setItem(
        "latestAnalysis",
        JSON.stringify(response.data)
      );

      // Go to analysis page
      navigate(
        `/analysis?ticket=${encodeURIComponent(
          ticketId
        )}`
      );

    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
        "AI analysis failed"
      );

    } finally {
      setAnalyzing("");
    }
  };

  // =====================================================
  // PRIORITY
  // =====================================================

  const getPriorityClass = (priority) => {
    const value =
      String(priority || "").toUpperCase();

    if (value === "CRITICAL")
      return "badge critical";

    if (value === "HIGH")
      return "badge high";

    if (value === "MEDIUM")
      return "badge medium";

    if (value === "LOW")
      return "badge low";

    return "badge";
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (status) => {
    const value =
      String(status || "").toUpperCase();

    if (value === "OPEN")
      return "badge open";

    if (value === "CLOSED")
      return "badge approved";

    if (value === "PENDING")
      return "badge pending";

    if (value === "REJECTED")
      return "badge rejected";

    return "badge";
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const criticalCount =
    tickets.filter(
      (ticket) =>
        String(ticket.priority || "")
          .toUpperCase() === "CRITICAL"
    ).length;

  const highCount =
    tickets.filter(
      (ticket) =>
        String(ticket.priority || "")
          .toUpperCase() === "HIGH"
    ).length;

  const openCount =
    tickets.filter(
      (ticket) =>
        String(ticket.status || "")
          .toUpperCase() === "OPEN"
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-heading">

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
          {message}
        </div>
      )}


      {/* STATISTICS */}

      <div className="mini-stats">

        <div className="mini-card">
          <span>🎫</span>

          <div>
            <small>
              Total Tickets
            </small>

            <strong>
              {tickets.length}
            </strong>
          </div>
        </div>


        <div className="mini-card">
          <span>🔴</span>

          <div>
            <small>
              Critical
            </small>

            <strong>
              {criticalCount}
            </strong>
          </div>
        </div>


        <div className="mini-card">
          <span>🟠</span>

          <div>
            <small>
              High Priority
            </small>

            <strong>
              {highCount}
            </strong>
          </div>
        </div>


        <div className="mini-card">
          <span>🟢</span>

          <div>
            <small>
              Open
            </small>

            <strong>
              {openCount}
            </strong>
          </div>
        </div>

      </div>


      {/* TICKET TABLE */}

      <div className="content-card">

        <div className="content-card-header">

          <div>
            <h3>
              All Support Tickets
            </h3>

            <p>
              AI-powered ticket investigation
            </p>
          </div>

          <span className="record-count">
            {tickets.length} records
          </span>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading support tickets...
          </div>

        ) : tickets.length === 0 ? (

          <div className="empty-state">
            No support tickets found.
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

                {tickets.map((ticket) => (

                  <tr key={ticket.id}>

                    <td>
                      <strong>
                        {ticket.ticket_id}
                      </strong>
                    </td>

                    <td>
                      {ticket.customer_id}
                    </td>

                    <td>
                      {ticket.subject}
                    </td>

                    <td>
                      <span
                        className={getPriorityClass(
                          ticket.priority
                        )}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          ticket.status
                        )}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      {ticket.transaction_id ||
                        "N/A"}
                    </td>

                    <td>

                      <button
                        className="analyze-btn"
                        disabled={
                          analyzing ===
                          ticket.ticket_id
                        }
                        onClick={() =>
                          analyzeTicket(
                            ticket.ticket_id
                          )
                        }
                      >

                        {analyzing ===
                        ticket.ticket_id
                          ? "⏳ Analyzing..."
                          : "🤖 Analyze"}

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Tickets;