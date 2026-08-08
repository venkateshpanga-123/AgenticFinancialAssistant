import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ticketId = searchParams.get("ticket");

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD / ANALYZE
  // =====================================================

  useEffect(() => {
    if (!ticketId) {
      setError("No ticket ID provided.");
      setLoading(false);
      return;
    }

    analyzeTicket(ticketId);
  }, [ticketId]);

  // =====================================================
  // CALL AI AGENT
  // =====================================================

  const analyzeTicket = async (id) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Starting AI analysis:",
        id
      );

      const response = await axios.post(
        `${API}/agent/process/${id}`
      );

      console.log(
        "AI response:",
        response.data
      );

      setAnalysis(response.data);

      sessionStorage.setItem(
        "latestAnalysis",
        JSON.stringify(response.data)
      );

    } catch (err) {
      console.error(
        "AI analysis failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "AI analysis failed. Check backend terminal."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-card">

        <div className="empty-state">

          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px"
            }}
          >
            🤖
          </div>

          <h2>
            AI Agents Analyzing Ticket
          </h2>

          <p>
            Ticket: <strong>{ticketId}</strong>
          </p>

          <p>
            Support Agent → Risk Agent →
            Fraud Agent → Decision Agent
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div>

        <div className="page-toolbar">

          <div>
            <h2>
              AI Financial Analysis
            </h2>

            <p>
              Multi-agent financial analysis.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/tickets")
            }
          >
            ← Back to Tickets
          </button>

        </div>

        <div className="message">
          ⚠️ {error}
        </div>

      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="dashboard-card">
        <div className="empty-state">
          No analysis result available.
        </div>
      </div>
    );
  }

  // =====================================================
  // VALUES
  // =====================================================

  const riskLevel =
    String(
      analysis.risk_level ||
      "UNKNOWN"
    ).toUpperCase();

  const riskScore =
    analysis.risk_score ?? 0;

  const decision =
    analysis.decision ||
    "N/A";

  const recommendedAction =
    analysis.recommended_action ||
    "N/A";

  const reasons =
    analysis.reasons || [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>

      {/* HEADER */}

      <div className="page-toolbar">

        <div>

          <h2>
            AI Financial Analysis
          </h2>

          <p>
            Multi-agent analysis for{" "}
            <strong>
              {analysis.ticket_id}
            </strong>
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/tickets")
          }
        >
          ← Back to Tickets
        </button>

      </div>


      {/* TICKET DETAILS */}

      <div className="stats-grid">

        <div className="stat-card blue">

          <span>🎫</span>

          <p>
            Ticket ID
          </p>

          <strong>
            {analysis.ticket_id}
          </strong>

          <small>
            Support case
          </small>

        </div>


        <div className="stat-card orange">

          <span>💳</span>

          <p>
            Transaction
          </p>

          <strong>
            {analysis.transaction_id ||
              "N/A"}
          </strong>

          <small>
            Linked transaction
          </small>

        </div>


        <div
          className={
            riskLevel === "HIGH"
              ? "stat-card red"
              : riskLevel === "MEDIUM"
              ? "stat-card orange"
              : "stat-card green"
          }
        >

          <span>
            🛡️
          </span>

          <p>
            Risk Level
          </p>

          <strong>
            {riskLevel}
          </strong>

          <small>
            AI classification
          </small>

        </div>


        <div className="stat-card blue">

          <span>
            📊
          </span>

          <p>
            Risk Score
          </p>

          <strong>
            {riskScore}
          </strong>

          <small>
            Score out of 100
          </small>

        </div>

      </div>


      {/* DECISION */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              AI Decision
            </h2>

            <p>
              Final decision from the
              agentic workflow.
            </p>

          </div>

          <span
            className={
              riskLevel === "HIGH"
                ? "badge high"
                : riskLevel === "MEDIUM"
                ? "badge medium"
                : "badge low"
            }
          >
            {riskLevel}
          </span>

        </div>


        <div className="analysis-result">

          <div className="score-box">

            <span>
              Risk Score
            </span>

            <strong>
              {riskScore}
            </strong>

            <small>
              / 100
            </small>

          </div>


          <div className="decision-box">

            <span>
              Decision
            </span>

            <strong>
              {decision}
            </strong>

            <p>
              {recommendedAction}
            </p>

          </div>

        </div>


        {/* EXPLANATION */}

        <div className="reason-box">

          <h3>
            Explanation
          </h3>

          <p>
            {analysis.explanation ||
              "No explanation provided."}
          </p>

        </div>


        {/* RISK REASONS */}

        <div className="reason-box">

          <h3>
            Risk Reasons
          </h3>

          {reasons.length > 0 ? (

            <ul>

              {reasons.map(
                (reason, index) => (

                  <li key={index}>
                    {reason}
                  </li>

                )
              )}

            </ul>

          ) : (

            <p>
              No specific risk reasons.
            </p>

          )}

        </div>


        {/* HUMAN APPROVAL */}

        {analysis.requires_human_approval && (

          <div className="approval-banner">

            <div>

              <strong>
                👤 Human Approval Required
              </strong>

              <p>
                This high-risk action cannot
                proceed automatically.
              </p>

            </div>

            <button
              className="analyze-btn"
              onClick={() =>
                navigate("/approvals")
              }
            >
              View Approval
            </button>

          </div>

        )}


        {/* AUDIT */}

        {analysis.audit_log_id && (

          <div className="audit-info">

            <strong>
              ✓ Audit Record Created
            </strong>

            <span>
              Audit ID:{" "}
              {analysis.audit_log_id}
            </span>

          </div>

        )}

      </div>


      {/* AGENT PIPELINE */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Agent Processing Pipeline
            </h2>

            <p>
              Multi-agent decision process.
            </p>

          </div>

        </div>


        <div className="agent-flow">

          <div className="agent-box">

            <div className="agent-number">
              AGENT 01
            </div>

            <div className="agent-title">
              🎫 Support Agent
            </div>

            <div className="agent-description">
              Understands the customer
              support request.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box">

            <div className="agent-number">
              AGENT 02
            </div>

            <div className="agent-title">
              📊 Risk Agent
            </div>

            <div className="agent-description">
              Calculates transaction risk.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box">

            <div className="agent-number">
              AGENT 03
            </div>

            <div className="agent-title">
              🛡️ Fraud Agent
            </div>

            <div className="agent-description">
              Investigates suspicious activity.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box">

            <div className="agent-number">
              AGENT 04
            </div>

            <div className="agent-title">
              ⚙️ Decision Agent
            </div>

            <div className="agent-description">
              Determines final action and
              approval requirement.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analysis;