import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    transaction_id: "",
    customer_id: "",
    amount: "",
    payment_method: "BANK_TRANSFER",
    status: "SUCCESS",
    failure_reason: "",
    dispute_status: "NONE",
  });

  // =========================================
  // LOAD TRANSACTIONS
  // =========================================

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/transactions/`
      );

      setTransactions(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // CREATE TRANSACTION
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!form.transaction_id.trim()) {
      setError("Please enter a transaction ID.");
      return;
    }

    if (!form.customer_id.trim()) {
      setError("Please enter a customer ID.");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Please enter a valid transaction amount."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        transaction_id:
          form.transaction_id.trim(),

        customer_id:
          form.customer_id.trim(),

        amount:
          Number(form.amount),

        payment_method:
          form.payment_method,

        status:
          form.status,

        failure_reason:
          form.failure_reason.trim() || null,

        dispute_status:
          form.dispute_status,
      };

      console.log(
        "Creating transaction:",
        payload
      );

      const response = await axios.post(
        `${API}/transactions/`,
        payload
      );

      console.log(
        "Transaction created:",
        response.data
      );

      setMessage(
        `Transaction ${form.transaction_id} created successfully.`
      );

      // Clear form
      setForm({
        transaction_id: "",
        customer_id: "",
        amount: "",
        payment_method: "BANK_TRANSFER",
        status: "SUCCESS",
        failure_reason: "",
        dispute_status: "NONE",
      });

      // Reload table
      await loadTransactions();

      // If high risk, the backend risk analysis
      // has already been executed.
      // User can continue to Risk page.
      
    } catch (err) {
      console.error(
        "Transaction creation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to create transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // STATISTICS
  // =========================================

  const total =
    transactions.length;

  const successful =
    transactions.filter(
      (transaction) =>
        String(transaction.status).toUpperCase() ===
        "SUCCESS"
    ).length;

  const failed =
    transactions.filter(
      (transaction) =>
        ["FAILED", "DECLINED"].includes(
          String(
            transaction.status
          ).toUpperCase()
        )
    ).length;

  const totalAmount =
    transactions.reduce(
      (sum, transaction) =>
        sum +
        Number(transaction.amount || 0),
      0
    );

  // =========================================
  // UI
  // =========================================

  return (
    <div>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-toolbar">

        <div>

          <h2>
            Transactions
          </h2>

          <p>
            Create, monitor and analyze
            financial transactions.
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={loadTransactions}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="message success-message">
          {message}
        </div>
      )}


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="error-message">
          {error}

          <button
            className="message-close"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}


      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="stats-grid">

        <div className="stat-card blue">

          <span>💳</span>

          <p>
            Transactions
          </p>

          <strong>
            {total}
          </strong>

          <small>
            Total transactions
          </small>

        </div>


        <div className="stat-card green">

          <span>✓</span>

          <p>
            Successful
          </p>

          <strong>
            {successful}
          </strong>

          <small>
            Completed transactions
          </small>

        </div>


        <div className="stat-card red">

          <span>✕</span>

          <p>
            Failed
          </p>

          <strong>
            {failed}
          </strong>

          <small>
            Failed or declined
          </small>

        </div>


        <div className="stat-card orange">

          <span>₹</span>

          <p>
            Total Value
          </p>

          <strong>
            ₹
            {totalAmount.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Transaction value
          </small>

        </div>

      </div>


      {/* =====================================
          CREATE TRANSACTION
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              💰 Enter Money / Create Transaction
            </h2>

            <p>
              Enter the transaction details.
              The system will automatically run
              risk analysis.
            </p>

          </div>

        </div>


        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          {/* TRANSACTION ID */}

          <div className="form-group">

            <label>
              Transaction ID
            </label>

            <input
              type="text"
              name="transaction_id"
              value={
                form.transaction_id
              }
              onChange={handleChange}
              placeholder="Example: TXN-2001"
            />

          </div>


          {/* CUSTOMER ID */}

          <div className="form-group">

            <label>
              Customer ID
            </label>

            <input
              type="text"
              name="customer_id"
              value={
                form.customer_id
              }
              onChange={handleChange}
              placeholder="Example: CUST-101"
            />

          </div>


          {/* AMOUNT */}

          <div className="form-group amount-field">

            <label>
              Amount ₹
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />

            <small>
              Enter the amount of money to
              transfer.
            </small>

          </div>


          {/* PAYMENT METHOD */}

          <div className="form-group">

            <label>
              Payment Method
            </label>

            <select
              name="payment_method"
              value={
                form.payment_method
              }
              onChange={handleChange}
            >

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="CARD">
                Card
              </option>

              <option value="CASH">
                Cash
              </option>

            </select>

          </div>


          {/* STATUS */}

          <div className="form-group">

            <label>
              Transaction Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >

              <option value="SUCCESS">
                SUCCESS
              </option>

              <option value="FAILED">
                FAILED
              </option>

              <option value="DECLINED">
                DECLINED
              </option>

            </select>

          </div>


          {/* DISPUTE */}

          <div className="form-group">

            <label>
              Dispute Status
            </label>

            <select
              name="dispute_status"
              value={
                form.dispute_status
              }
              onChange={handleChange}
            >

              <option value="NONE">
                NONE
              </option>

              <option value="OPEN">
                OPEN
              </option>

              <option value="DISPUTED">
                DISPUTED
              </option>

            </select>

          </div>


          {/* FAILURE REASON */}

          <div className="form-group full-width">

            <label>
              Failure Reason
            </label>

            <input
              type="text"
              name="failure_reason"
              value={
                form.failure_reason
              }
              onChange={handleChange}
              placeholder="Optional"
            />

          </div>


          {/* SUBMIT */}

          <div className="form-submit">

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : "💰 Submit Transaction"}
            </button>

          </div>

        </form>

      </div>


      {/* =====================================
          TRANSACTION TABLE
      ===================================== */}

      <div className="dashboard-card">

        <div className="section-title">

          <div>

            <h2>
              Transaction Registry
            </h2>

            <p>
              Existing financial transactions.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading transactions...
          </div>

        ) : transactions.length === 0 ? (

          <div className="empty-state">
            No transactions found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Transaction ID
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Risk
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  (transaction) => (

                    <tr
                      key={
                        transaction.id ||
                        transaction.transaction_id
                      }
                    >

                      <td>

                        <strong>
                          {
                            transaction.transaction_id
                          }
                        </strong>

                      </td>


                      <td>
                        {
                          transaction.customer_id
                        }
                      </td>


                      <td>

                        <strong>
                          ₹
                          {Number(
                            transaction.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </td>


                      <td>
                        {
                          transaction.payment_method ||
                          "N/A"
                        }
                      </td>


                      <td>

                        <span
                          className={
                            `badge ${
                              String(
                                transaction.status
                              ).toUpperCase() ===
                              "SUCCESS"
                                ? "approved"
                                : "rejected"
                            }`
                          }
                        >
                          {
                            transaction.status
                          }
                        </span>

                      </td>


                      <td>

                        <button
                          className="small-action-btn"
                          onClick={() =>
                            navigate(
                              `/risk?transaction=${transaction.transaction_id}`
                            )
                          }
                        >
                          🛡️ Analyze
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

export default Transactions;