import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Audit() {

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAudit = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API}/audit/`
      );

      setRecords(response.data);

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
        "Unable to load audit records"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const approved = records.filter(
    (item) =>
      item.decision?.toUpperCase() === "APPROVED"
  ).length;

  const rejected = records.filter(
    (item) =>
      item.decision?.toUpperCase() === "REJECTED"
  ).length;

  const waiting = records.filter(
    (item) =>
      item.decision?.toUpperCase() ===
      "WAITING_FOR_APPROVAL"
  ).length;

  return (
    <div className="page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="page-toolbar">

        <div>
          <h2>
            Audit Trail
          </h2>

          <p>
            Complete history of AI decisions,
            human approvals and system actions.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadAudit}
        >
          ? Refresh
        </button>

      </div>


      {/* ================================================= */}
      {/* MESSAGE */}
      {/* ================================================= */}

      {message && (
        <div className="message">
          {message}
        </div>
      )}


      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <div className="stats-grid">

        <div className="stat-card blue">
          <span>??</span>

          <p>
            Total Records
          </p>

          <strong>
            {records.length}
          </strong>

          <small>
            Audit events
          </small>
        </div>


        <div className="stat-card green">
          <span>?</span>

          <p>
            Approved
          </p>

          <strong>
            {approved}
          </strong>

          <small>
            Human approvals
          </small>
        </div>


        <div className="stat-card red">
          <span>?</span>

          <p>
            Rejected
          </p>

          <strong>
            {rejected}
          </strong>

          <small>
            Rejected actions
          </small>
        </div>


        <div className="stat-card orange">
          <span>?</span>

          <p>
            Waiting
          </p>

          <strong>
            {waiting}
          </strong>

          <small>
            Awaiting approval
          </small>
        </div>

      </div>


      {/* ================================================= */}
      {/* AUDIT REGISTRY */}
      {/* ================================================= */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>
            <h2>
              Audit Registry
            </h2>

            <p>
              AI and human decision history.
            </p>
          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading audit records...
          </div>

        ) : records.length === 0 ? (

          <div className="empty-state">
            No audit records available.
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Decision</th>
                  <th>Reason</th>
                  <th>Human Approval</th>
                  <th>Created</th>
                </tr>

              </thead>


              <tbody>

                {records.map(
                  (record) => {

                    const decision =
                      record.decision?.toUpperCase();

                    let badgeClass = "pending";

                    if (
                      decision === "APPROVED"
                    ) {
                      badgeClass = "approved";
                    }

                    if (
                      decision === "REJECTED"
                    ) {
                      badgeClass = "rejected";
                    }

                    if (
                      decision ===
                      "WAITING_FOR_APPROVAL"
                    ) {
                      badgeClass = "pending";
                    }

                    return (

                      <tr key={record.id}>

                        <td>
                          #{record.id}
                        </td>


                        <td>
                          <strong>
                            {record.action}
                          </strong>
                        </td>


                        <td>
                          <div>
                            {record.entity_type}
                          </div>

                          <small>
                            {record.entity_id}
                          </small>
                        </td>


                        <td>

                          <span
                            className={
                              `badge ${badgeClass}`
                            }
                          >
                            {record.decision}
                          </span>

                        </td>


                        <td>
                          {record.reason}
                        </td>


                        <td>

                          {record.requires_human_approval
                            ? (
                              <span className="badge high">
                                YES
                              </span>
                            )
                            : (
                              <span className="badge low">
                                NO
                              </span>
                            )}

                        </td>


                        <td>
                          {record.created_at
                            ? new Date(
                                record.created_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
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

    </div>
  );
}

export default Audit;
