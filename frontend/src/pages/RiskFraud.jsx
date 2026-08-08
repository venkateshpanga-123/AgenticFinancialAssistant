import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function RiskFraud() {
  const [riskData, setRiskData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD RISK DATA
  // =========================================

  const loadRiskData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get latest AI analysis
      const storedAnalysis =
        sessionStorage.getItem("latestAnalysis");

      let analysis = null;

      if (storedAnalysis) {
        try {
          analysis = JSON.parse(storedAnalysis);
          setAnalysisData(analysis);
        } catch (err) {
          console.error(
            "Invalid analysis data:",
            err
          );
        }
      }

      // Find transaction ID
      const transactionId =
        analysis?.transaction_id ||
        analysis?.transactionId ||
        analysis?.agents?.risk_agent
          ?.transaction_id;

      if (!transactionId) {
        setError(
          "No analyzed transaction found. Go to Support Tickets and analyze a ticket first."
        );

        setLoading(false);
        return;
      }

      // Call backend risk API
      const response = await axios.get(
        `${API}/risk/analyze/${transactionId}`
      );

      console.log(
        "Risk API response:",
        response.data
      );

      setRiskData(response.data);

    } catch (err) {
      console.error(
        "Risk analysis error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to load risk analysis"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, []);

  // =========================================
  // DATA
  // =========================================

  const riskScore =
    riskData?.risk_score ??
    analysisData?.risk_score ??
    analysisData?.agents?.risk_agent?.score ??
    0;

  const riskLevel =
    (
      riskData?.risk_level ||
      analysisData?.risk_level ||
      analysisData?.agents?.risk_agent?.level ||
      "LOW"
    ).toUpperCase();

  const transactionId =
    riskData?.transaction_id ||
    analysisData?.transaction_id ||
    "N/A";

  const amount =
    riskData?.amount ??
    analysisData?.amount ??
    0;

  const riskReasons =
    riskData?.reasons ||
    analysisData?.risk_reasons ||
    analysisData?.agents?.risk_agent
      ?.reasons ||
    [];

  const fraudAgent =
    analysisData?.agents?.fraud_agent ||
    {};

  const fraudScore =
    fraudAgent.score ??
    analysisData?.fraud_score ??
    0;

  const fraudLevel =
    (
      fraudAgent.level ||
      analysisData?.fraud_level ||
      (fraudScore >= 70
        ? "HIGH"
        : fraudScore >= 30
        ? "MEDIUM"
        : "LOW")
    ).toUpperCase();

  const fraudReasons =
    fraudAgent.reasons ||
    analysisData?.fraud_reasons ||
    [];

  // =========================================
  // HELPERS
  // =========================================

  const getRiskBadge = (level) => {
    if (
      level === "HIGH" ||
      level === "CRITICAL"
    ) {
      return "badge high";
    }

    if (level === "MEDIUM") {
      return "badge medium";
    }

    return "badge low";
  };

  const getScoreClass = (score) => {
    if (score >= 70) {
      return "score-high";
    }

    if (score >= 30) {
      return "score-medium";
    }

    return "score-low";
  };

  const normalizeReasons = (reasons) => {
    if (Array.isArray(reasons)) {
      return reasons;
    }

    if (reasons) {
      return [String(reasons)];
    }

    return [];
  };

  const normalizedRiskReasons =
    normalizeReasons(riskReasons);

  const normalizedFraudReasons =
    normalizeReasons(fraudReasons);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="empty-state">
          <h2>
            🔍 Loading Risk & Fraud Analysis
          </h2>

          <p>
            Analyzing the latest transaction...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div>

        <div className="page-toolbar">

          <div>
            <h2>
              Risk & Fraud Detection
            </h2>

            <p>
              Monitor suspicious transactions
              and financial risk.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={loadRiskData}
          >
            ↻ Retry
          </button>

        </div>

        <div className="dashboard-card">

          <div className="empty-state">

            <h2>
              ⚠️ No Risk Analysis Available
            </h2>

            <p>
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div>

      {/* HEADER */}

      <div className="page-toolbar">

        <div>
          <h2>
            Risk & Fraud Detection
          </h2>

          <p>
            Monitor suspicious transactions
            and financial risk using AI.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadRiskData}
        >
          ↻ Refresh
        </button>

      </div>


      {/* STAT CARDS */}

      <div className="stats-grid">

        {/* HIGH */}

        <div className="stat-card red">

          <span>🚨</span>

          <p>
            High Risk
          </p>

          <strong>
            {riskLevel === "HIGH" ||
            riskLevel === "CRITICAL"
              ? 1
              : 0}
          </strong>

          <small>
            Requires investigation
          </small>

        </div>


        {/* MEDIUM */}

        <div className="stat-card orange">

          <span>⚠️</span>

          <p>
            Medium Risk
          </p>

          <strong>
            {riskLevel === "MEDIUM"
              ? 1
              : 0}
          </strong>

          <small>
            Requires review
          </small>

        </div>


        {/* LOW */}

        <div className="stat-card green">

          <span>✓</span>

          <p>
            Low Risk
          </p>

          <strong>
            {riskLevel === "LOW"
              ? 1
              : 0}
          </strong>

          <small>
            Normal transactions
          </small>

        </div>


        {/* FRAUD */}

        <div className="stat-card blue">

          <span>🛡️</span>

          <p>
            Fraud Alerts
          </p>

          <strong>
            {fraudLevel === "HIGH" ||
            fraudLevel === "CRITICAL"
              ? 1
              : 0}
          </strong>

          <small>
            Suspicious activity
          </small>

        </div>

      </div>


      {/* REGISTRY */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Risk & Fraud Registry
            </h2>

            <p>
              AI-generated risk assessment
              for the latest transaction.
            </p>

          </div>

        </div>


        {/* TRANSACTION DETAILS */}

        <div className="risk-info-grid">

          <div className="info-box">

            <span>
              Transaction ID
            </span>

            <strong>
              {transactionId}
            </strong>

          </div>


          <div className="info-box">

            <span>
              Amount
            </span>

            <strong>
              ₹
              {Number(amount).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          <div className="info-box">

            <span>
              Risk Level
            </span>

            <strong
              className={getScoreClass(
                riskScore
              )}
            >
              {riskLevel}
            </strong>

          </div>


          <div className="info-box">

            <span>
              Risk Score
            </span>

            <strong
              className={getScoreClass(
                riskScore
              )}
            >
              {riskScore}/100
            </strong>

          </div>

        </div>


        {/* RISK + FRAUD */}

        <div className="risk-analysis-grid">

          {/* RISK AGENT */}

          <div className="risk-panel">

            <div className="risk-panel-header">

              <div>

                <h3>
                  📊 Risk Agent
                </h3>

                <p>
                  Transaction risk assessment
                </p>

              </div>

              <span
                className={getRiskBadge(
                  riskLevel
                )}
              >
                {riskLevel}
              </span>

            </div>


            <div className="score-container">

              <div>

                <span>
                  Risk Score
                </span>

                <strong
                  className={getScoreClass(
                    riskScore
                  )}
                >
                  {riskScore}
                </strong>

                <small>
                  /100
                </small>

              </div>

            </div>


            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Number(riskScore) || 0,
                    100
                  )}%`,
                }}
              />

            </div>


            <h4>
              Risk Reasons
            </h4>


            {normalizedRiskReasons.length ===
            0 ? (

              <p className="muted">
                No significant risk indicators
                found.
              </p>

            ) : (

              <ul className="reason-list">

                {normalizedRiskReasons.map(
                  (reason, index) => (
                    <li key={index}>
                      {reason}
                    </li>
                  )
                )}

              </ul>

            )}

          </div>


          {/* FRAUD AGENT */}

          <div className="risk-panel">

            <div className="risk-panel-header">

              <div>

                <h3>
                  🚨 Fraud Agent
                </h3>

                <p>
                  Fraud detection assessment
                </p>

              </div>

              <span
                className={getRiskBadge(
                  fraudLevel
                )}
              >
                {fraudLevel}
              </span>

            </div>


            <div className="score-container">

              <div>

                <span>
                  Fraud Score
                </span>

                <strong
                  className={getScoreClass(
                    fraudScore
                  )}
                >
                  {fraudScore}
                </strong>

                <small>
                  /100
                </small>

              </div>

            </div>


            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Number(fraudScore) || 0,
                    100
                  )}%`,
                }}
              />

            </div>


            <h4>
              Fraud Indicators
            </h4>


            {normalizedFraudReasons.length ===
            0 ? (

              <p className="muted">
                No fraud indicators available
                from the latest AI analysis.
              </p>

            ) : (

              <ul className="reason-list">

                {normalizedFraudReasons.map(
                  (reason, index) => (
                    <li key={index}>
                      {reason}
                    </li>
                  )
                )}

              </ul>

            )}

          </div>

        </div>


        {/* RECOMMENDATION */}

        <div className="decision-panel">

          <div>

            <h3>
              🤖 AI Recommendation
            </h3>

            <p>
              {riskData?.recommended_action ||
                analysisData?.recommended_action ||
                "No recommendation available."}
            </p>

          </div>


          <div>

            {(
              analysisData
                ?.requires_human_approval
            ) ? (

              <span className="approval-required">
                ⚠ Human Approval Required
              </span>

            ) : (

              <span className="approval-not-required">
                ✓ No Human Approval Required
              </span>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default RiskFraud;