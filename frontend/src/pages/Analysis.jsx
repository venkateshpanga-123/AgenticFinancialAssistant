import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ticketId = searchParams.get("ticket");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticketId) {
      setError("No ticket ID provided.");
      setLoading(false);
      return;
    }

    const runAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.post(
          `${API}/agent/process/${ticketId}`
        );

        console.log("AI Analysis:", response.data);

        setData(response.data);

        sessionStorage.setItem(
          "latestAnalysis",
          JSON.stringify(response.data)
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "AI analysis failed."
        );
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [ticketId]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-icon">
          🤖
        </div>

        <h2>
          AI Agents Analyzing...
        </h2>

        <p>
          Processing ticket{" "}
          <strong>{ticketId}</strong>
        </p>

        <div className="agent-progress">
          <span>🎫 Support Agent</span>
          <span>📊 Risk Agent</span>
          <span>🛡️ Fraud Agent</span>
          <span>⚙️ Decision Agent</span>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="dashboard-card">
        <div className="error-box">

          <h2>
            ❌ Analysis Failed
          </h2>

          <p>
            {error}
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/tickets")
            }
          >
            ← Back to Tickets
          </button>

        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-card">
        <div className="empty-state">
          No analysis available.
        </div>
      </div>
    );
  }

  // =========================================
  // DATA
  // =========================================

  const riskLevel =
    String(
      data.risk_level || "UNKNOWN"
    ).toUpperCase();

  const riskScore =
    data.risk_score ?? 0;

  const decision =
    data.decision || "N/A";

  const requiresApproval =
    data.requires_human_approval === true;

  const supportAgent =
    data.agents?.support_agent || {};

  const riskAgent =
    data.agents?.risk_agent || {};

  const fraudAgent =
    data.agents?.fraud_agent || {};

  const decisionAgent =
    data.agents?.decision_agent || {};

  const transactionId =
    data.transaction_id || "N/A";

  // =========================================
  // RISK CLASS
  // =========================================

  const getRiskClass = () => {
    if (riskLevel === "HIGH") {
      return "risk-high";
    }

    if (riskLevel === "MEDIUM") {
      return "risk-medium";
    }

    if (riskLevel === "LOW") {
      return "risk-low";
    }

    return "risk-unknown";
  };

  // =========================================
  // GO TO RISK & FRAUD
  // =========================================

  const goToRisk = () => {
    navigate(
      `/risk?ticket=${ticketId}&transaction=${transactionId}`
    );
  };

  // =========================================
  // GO TO APPROVALS
  // =========================================

  const goToApproval = () => {
    navigate(
      `/approvals?ticket=${ticketId}&transaction=${transactionId}`
    );
  };

  // =========================================
  // GO TO AUDIT
  // =========================================

  const goToAudit = () => {
    navigate("/audit");
  };

  return (
    <div>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-toolbar">

        <div>

          <h2>
            AI Financial Analysis
          </h2>

          <p>
            Multi-agent investigation and
            financial risk assessment.
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


      {/* =====================================
          WORKFLOW
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Investigation Workflow
            </h2>

            <p>
              Current ticket processing stage.
            </p>

          </div>

        </div>


        <div className="agent-pipeline">

          <div className="pipeline-step active">
            <span>🎫</span>
            <strong>
              Support Ticket
            </strong>
            <small>
              Ticket Received
            </small>
          </div>

          <div className="pipeline-arrow">
            →
          </div>

          <div className="pipeline-step active">
            <span>🤖</span>
            <strong>
              AI Analysis
            </strong>
            <small>
              Completed
            </small>
          </div>

          <div className="pipeline-arrow">
            →
          </div>

          <div
            className="pipeline-step clickable"
            onClick={goToRisk}
          >
            <span>🛡️</span>
            <strong>
              Risk & Fraud
            </strong>
            <small>
              View Assessment
            </small>
          </div>

          <div className="pipeline-arrow">
            →
          </div>

          <div
            className={
              `pipeline-step ${
                requiresApproval
                  ? "requires-action"
                  : "completed"
              }`
            }
          >
            <span>👤</span>
            <strong>
              Human Approval
            </strong>
            <small>
              {requiresApproval
                ? "Required"
                : "Not Required"}
            </small>
          </div>

          <div className="pipeline-arrow">
            →
          </div>

          <div
            className="pipeline-step clickable"
            onClick={goToAudit}
          >
            <span>📋</span>
            <strong>
              Audit
            </strong>
            <small>
              View Trail
            </small>
          </div>

        </div>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="analysis-summary">

        <div className="analysis-stat">

          <div className="analysis-stat-icon">
            🎫
          </div>

          <div>
            <small>
              Ticket ID
            </small>

            <strong>
              {data.ticket_id ||
                ticketId}
            </strong>
          </div>

        </div>


        <div className="analysis-stat">

          <div className="analysis-stat-icon">
            💳
          </div>

          <div>
            <small>
              Transaction
            </small>

            <strong>
              {transactionId}
            </strong>
          </div>

        </div>


        <div className="analysis-stat">

          <div className="analysis-stat-icon">
            📊
          </div>

          <div>
            <small>
              Risk Score
            </small>

            <strong>
              {riskScore}/100
            </strong>
          </div>

        </div>


        <div className="analysis-stat">

          <div className="analysis-stat-icon">
            🛡️
          </div>

          <div>
            <small>
              Risk Level
            </small>

            <strong
              className={getRiskClass()}
            >
              {riskLevel}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          FINAL DECISION
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Final AI Decision
            </h2>

            <p>
              Decision generated by the
              multi-agent workflow.
            </p>

          </div>

        </div>


        <div className="decision-panel">

          <div className="decision-score">

            <div className="score-circle">

              <strong>
                {riskScore}
              </strong>

              <span>
                /100
              </span>

            </div>

            <p>
              Risk Score
            </p>

          </div>


          <div className="decision-content">

            <span className="decision-label">
              DECISION
            </span>

            <h2>
              {decision}
            </h2>

            <p>
              {data.recommended_action ||
                "No recommended action available."}
            </p>

            {requiresApproval && (
              <div className="approval-warning">
                ⚠️ Human approval is required
                before this action can proceed.
              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================
          AGENT RESULTS
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              AI Agent Results
            </h2>

            <p>
              Detailed results from each
              specialized financial agent.
            </p>

          </div>

        </div>


        <div className="agent-grid">

          {/* SUPPORT */}

          <div className="agent-card">

            <div className="agent-card-header">

              <span className="agent-icon">
                🎫
              </span>

              <div>
                <h3>
                  Support Agent
                </h3>

                <span>
                  Customer Investigation
                </span>
              </div>

            </div>

            <div className="agent-detail">
              <label>
                Category
              </label>

              <strong>
                {supportAgent.category ||
                  "N/A"}
              </strong>
            </div>

            <div className="agent-detail">
              <label>
                Priority
              </label>

              <strong>
                {supportAgent.priority ||
                  "N/A"}
              </strong>
            </div>

            <div className="agent-reason">
              <label>
                Reason
              </label>

              <p>
                {supportAgent.reason ||
                  "No reason provided."}
              </p>
            </div>

          </div>


          {/* RISK */}

          <div className="agent-card">

            <div className="agent-card-header">

              <span className="agent-icon">
                📊
              </span>

              <div>
                <h3>
                  Risk Agent
                </h3>

                <span>
                  Financial Risk Assessment
                </span>
              </div>

            </div>


            <div className="agent-score">

              <strong>
                {riskAgent.score ??
                  riskScore}
              </strong>

              <span>
                /100
              </span>

            </div>


            <div className="agent-detail">

              <label>
                Risk Level
              </label>

              <strong>
                {riskAgent.level ||
                  riskLevel}
              </strong>

            </div>


            <div className="agent-reason">

              <label>
                Risk Reasons
              </label>

              {Array.isArray(
                riskAgent.reasons
              ) ? (

                <ul>

                  {riskAgent.reasons.map(
                    (reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p>
                  {riskAgent.reasons ||
                    "No reasons provided."}
                </p>

              )}

            </div>

          </div>


          {/* FRAUD */}

          <div className="agent-card">

            <div className="agent-card-header">

              <span className="agent-icon">
                🛡️
              </span>

              <div>
                <h3>
                  Fraud Agent
                </h3>

                <span>
                  Fraud Detection
                </span>
              </div>

            </div>


            <div className="agent-score">

              <strong>
                {fraudAgent.score ??
                  0}
              </strong>

              <span>
                /100
              </span>

            </div>


            <div className="agent-detail">

              <label>
                Risk Level
              </label>

              <strong>
                {fraudAgent.level ||
                  "N/A"}
              </strong>

            </div>


            <div className="agent-reason">

              <label>
                Fraud Indicators
              </label>

              {Array.isArray(
                fraudAgent.reasons
              ) ? (

                <ul>

                  {fraudAgent.reasons.map(
                    (reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p>
                  {fraudAgent.reasons ||
                    "No indicators provided."}
                </p>

              )}

            </div>

          </div>


          {/* DECISION */}

          <div className="agent-card">

            <div className="agent-card-header">

              <span className="agent-icon">
                ⚙️
              </span>

              <div>
                <h3>
                  Decision Agent
                </h3>

                <span>
                  Final Decision
                </span>
              </div>

            </div>


            <div className="agent-detail">

              <label>
                Decision
              </label>

              <strong>
                {decisionAgent.decision ||
                  decision}
              </strong>

            </div>


            <div className="agent-reason">

              <label>
                Recommendation
              </label>

              <p>
                {decisionAgent.recommended_action ||
                  data.recommended_action ||
                  "No recommendation."}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================
          RISK & FRAUD BUTTON
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              🛡️ Risk & Fraud Assessment
            </h2>

            <p>
              Review detailed transaction risk
              and fraud indicators before approval.
            </p>

          </div>

        </div>


        <div className="workflow-action">

          <div>

            <strong>
              Risk Level: {riskLevel}
            </strong>

            <p>
              Transaction: {transactionId}
            </p>

          </div>

          <button
            className="primary-btn"
            onClick={goToRisk}
          >
            View Risk & Fraud →
          </button>

        </div>

      </div>


      {/* =====================================
          HUMAN APPROVAL
      ===================================== */}

      {requiresApproval && (

        <div className="approval-card">

          <div className="approval-icon">
            👤
          </div>

          <div className="approval-content">

            <h2>
              Human Approval Required
            </h2>

            <p>
              This transaction has been
              classified as high risk.
              A human reviewer must approve
              or reject the action.
            </p>

          </div>

          <button
            className="approval-btn"
            onClick={goToApproval}
          >
            Review Approval →
          </button>

        </div>

      )}


      {/* =====================================
          LOW RISK
      ===================================== */}

      {!requiresApproval && (

        <div className="success-card">

          <span>
            ✓
          </span>

          <div>

            <strong>
              No Human Approval Required
            </strong>

            <p>
              The transaction does not require
              manual approval based on the
              current AI decision.
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          AUDIT
      ===================================== */}

      {data.audit_log_id && (

        <div className="audit-success">

          <span>
            ✓
          </span>

          <div>

            <strong>
              Audit Record Created
            </strong>

            <p>
              Audit ID:{" "}
              {data.audit_log_id}
            </p>

          </div>

          <button
            className="secondary-btn"
            onClick={goToAudit}
          >
            View Audit Trail
          </button>

        </div>

      )}

    </div>
  );
}

export default Analysis;