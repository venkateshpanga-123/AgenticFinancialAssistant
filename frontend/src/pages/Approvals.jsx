import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Approvals() {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // =========================================
  // LOAD APPROVALS
  // =========================================

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API}/approvals/`
      );

      console.log("Approvals:", response.data);

      setApprovals(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load approvals:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to load approval requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadApprovals();
  }, []);

  // =========================================
  // APPROVE
  // =========================================

  const approve = async (id) => {
    try {
      setProcessingId(id);
      setMessage("");

      await axios.put(
        `${API}/approvals/${id}/approve`,
        {
          reviewer_note:
            "Approved by human reviewer",
        }
      );

      setMessage(
        "✓ Approval completed successfully."
      );

      await loadApprovals();
    } catch (error) {
      console.error(
        "Approval failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Approval failed"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // REJECT
  // =========================================

  const reject = async (id) => {
    try {
      setProcessingId(id);
      setMessage("");

      await axios.put(
        `${API}/approvals/${id}/reject`,
        {
          reviewer_note:
            "Rejected by human reviewer",
        }
      );

      setMessage(
        "✓ Request rejected successfully."
      );

      await loadApprovals();
    } catch (error) {
      console.error(
        "Rejection failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Rejection failed"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // COUNTS
  // =========================================

  const pending = approvals.filter(
    (item) =>
      String(item.status).toUpperCase() ===
      "PENDING"
  );

  const approved = approvals.filter(
    (item) =>
      String(item.status).toUpperCase() ===
      "APPROVED"
  );

  const rejected = approvals.filter(
    (item) =>
      String(item.status).toUpperCase() ===
      "REJECTED"
  );

  // =========================================
  // GO TO AUDIT
  // =========================================

  const goToAudit = () => {
    navigate("/audit");
  };

  // =========================================
  // FORMAT AMOUNT
  // =========================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN"
    );
  };

  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (status) => {
    const value =
      String(status).toUpperCase();

    if (value === "APPROVED") {
      return "approved";
    }

    if (value === "REJECTED") {
      return "rejected";
    }

    return "pending";
  };

  // =========================================
  // RISK CLASS
  // =========================================

  const getRiskClass = (risk) => {
    const value =
      String(risk).toUpperCase();

    if (value === "HIGH") {
      return "high";
    }

    if (value === "MEDIUM") {
      return "medium";
    }

    return "low";
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div>

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-toolbar">

        <div>

          <h2>
            Human Approvals
          </h2>

          <p>
            Review high-risk actions before
            they are executed.
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={loadApprovals}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="message">
          {message}
        </div>
      )}


      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="stats-grid">

        {/* PENDING */}

        <div className="stat-card orange">

          <span>
            ⏳
          </span>

          <p>
            Pending
          </p>

          <strong>
            {pending.length}
          </strong>

          <small>
            Waiting for review
          </small>

        </div>


        {/* APPROVED */}

        <div className="stat-card green">

          <span>
            ✓
          </span>

          <p>
            Approved
          </p>

          <strong>
            {approved.length}
          </strong>

          <small>
            Approved actions
          </small>

        </div>


        {/* REJECTED */}

        <div className="stat-card red">

          <span>
            ✕
          </span>

          <p>
            Rejected
          </p>

          <strong>
            {rejected.length}
          </strong>

          <small>
            Rejected actions
          </small>

        </div>


        {/* TOTAL */}

        <div className="stat-card blue">

          <span>
            📋
          </span>

          <p>
            Total Requests
          </p>

          <strong>
            {approvals.length}
          </strong>

          <small>
            All approval requests
          </small>

        </div>

      </div>


      {/* =====================================
          APPROVAL REQUESTS
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Approval Requests
            </h2>

            <p>
              Human-in-the-loop decision queue.
            </p>

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">
            Loading approval requests...
          </div>

        ) : approvals.length === 0 ? (

          /* NO DATA */

          <div className="empty-state">

            <h3>
              No Approval Requests
            </h3>

            <p>
              No human approval requests
              are currently available.
            </p>

            <button
              className="secondary-btn"
              onClick={loadApprovals}
            >
              ↻ Try Again
            </button>

          </div>

        ) : (

          /* TABLE */

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Transaction
                  </th>

                  <th>
                    Action
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {approvals.map(
                  (approval) => {

                    const status =
                      String(
                        approval.status
                      ).toUpperCase();

                    const risk =
                      String(
                        approval.risk_level ||
                          "LOW"
                      ).toUpperCase();

                    const isProcessing =
                      processingId ===
                      approval.id;

                    return (
                      <tr
                        key={
                          approval.id
                        }
                      >

                        {/* ID */}

                        <td>
                          <strong>
                            #{approval.id}
                          </strong>
                        </td>


                        {/* TRANSACTION */}

                        <td>
                          <strong>
                            {
                              approval.transaction_id
                            }
                          </strong>
                        </td>


                        {/* ACTION */}

                        <td>
                          {
                            approval.action ||
                            "Financial Action"
                          }
                        </td>


                        {/* AMOUNT */}

                        <td>
                          ₹
                          {formatAmount(
                            approval.amount
                          )}
                        </td>


                        {/* RISK */}

                        <td>

                          <span
                            className={
                              `badge ${getRiskClass(
                                risk
                              )}`
                            }
                          >
                            {risk}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              `badge ${getStatusClass(
                                status
                              )}`
                            }
                          >
                            {status}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {status ===
                          "PENDING" ? (

                            <div className="actions">

                              <button
                                className="approve-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  approve(
                                    approval.id
                                  )
                                }
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "✓ Approve"}
                              </button>


                              <button
                                className="reject-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  reject(
                                    approval.id
                                  )
                                }
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "✕ Reject"}
                              </button>

                            </div>

                          ) : (

                            <span className="reviewed">
                              ✓ Reviewed
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================
          SELECTED HIGH-RISK INFORMATION
      ===================================== */}

      {pending.length > 0 && (

        <div className="approval-warning">

          <strong>
            ⚠️ Human Review Required
          </strong>

          <p>
            There are{" "}
            <strong>
              {pending.length}
            </strong>{" "}
            pending high-risk action
            {pending.length > 1
              ? "s"
              : ""}.
            Review and approve or reject
            the request before continuing.
          </p>

        </div>

      )}


      {/* =====================================
          NEXT → AUDIT
      ===================================== */}

      {approvals.length > 0 &&
        pending.length === 0 && (

        <div className="workflow-next">

          <div>

            <strong>
              ✓ Human Review Completed
            </strong>

            <p>
              All approval requests have
              been reviewed. Continue to
              the Audit Trail.
            </p>

          </div>

          <button
            className="primary-btn"
            onClick={goToAudit}
          >
            Next → Audit Trail
          </button>

        </div>

      )}

    </div>
  );
}

export default Approvals;