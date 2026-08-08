function Dashboard() {
  return (
    <div>

      <div className="page-toolbar">

        <div>
          <h2>
            Financial Operations Dashboard
          </h2>

          <p>
            Monitor transactions, risk, fraud,
            support and AI decisions.
          </p>
        </div>

      </div>


      <div className="stats-grid">

        <div className="stat-card blue">
          <span>💳</span>

          <p>
            Transactions
          </p>

          <strong>
            —
          </strong>

          <small>
            Total monitored
          </small>
        </div>


        <div className="stat-card red">
          <span>🚨</span>

          <p>
            High Risk
          </p>

          <strong>
            —
          </strong>

          <small>
            Requires attention
          </small>
        </div>


        <div className="stat-card orange">
          <span>👤</span>

          <p>
            Approvals
          </p>

          <strong>
            —
          </strong>

          <small>
            Human review
          </small>
        </div>


        <div className="stat-card green">
          <span>🎫</span>

          <p>
            Support Cases
          </p>

          <strong>
            —
          </strong>

          <small>
            Customer tickets
          </small>
        </div>

      </div>


      <div className="dashboard-card">

        <div className="section-title">

          <div>
            <h2>
              AI Agent Pipeline
            </h2>

            <p>
              Automated financial decision-making
              workflow.
            </p>
          </div>

        </div>


        <div className="agent-flow">

          <div className="agent-box support-agent">

            <div className="agent-number">
              AGENT 01
            </div>

            <div className="agent-title">
              🎫 Support Agent
            </div>

            <div className="agent-description">
              Understands customer requests
              and support cases.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box risk-agent">

            <div className="agent-number">
              AGENT 02
            </div>

            <div className="agent-title">
              📊 Risk Agent
            </div>

            <div className="agent-description">
              Evaluates transaction risk
              and financial exposure.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box fraud-agent">

            <div className="agent-number">
              AGENT 03
            </div>

            <div className="agent-title">
              🛡️ Fraud Agent
            </div>

            <div className="agent-description">
              Detects suspicious financial
              activity.
            </div>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="agent-box check-agent">

            <div className="agent-number">
              AGENT 04
            </div>

            <div className="agent-title">
              ⚙️ Decision Agent
            </div>

            <div className="agent-description">
              Determines the final action
              and approval requirement.
            </div>

          </div>

        </div>


        <div className="human-gate">

          <div className="human-icon">
            👤
          </div>

          <div>

            <strong>
              Human-in-the-Loop
            </strong>

            <p>
              High-risk financial actions
              require human approval.
            </p>

          </div>

        </div>

      </div>


      <div className="dashboard-grid">

        <div className="dashboard-card">

          <h2>
            System Status
          </h2>

          <div className="system-item">
            <span>
              Backend API
            </span>

            <strong className="online">
              ● Online
            </strong>
          </div>

          <div className="system-item">
            <span>
              Support Agent
            </span>

            <strong className="online">
              ● Ready
            </strong>
          </div>

          <div className="system-item">
            <span>
              Risk Agent
            </span>

            <strong className="online">
              ● Ready
            </strong>
          </div>

          <div className="system-item">
            <span>
              Fraud Agent
            </span>

            <strong className="online">
              ● Ready
            </strong>
          </div>

        </div>


        <div className="dashboard-card">

          <h2>
            Security
          </h2>

          <div className="system-item">
            <span>
              Authentication
            </span>

            <strong className="online">
              ✓ JWT
            </strong>
          </div>

          <div className="system-item">
            <span>
              Audit Trail
            </span>

            <strong className="online">
              ✓ Active
            </strong>
          </div>

          <div className="system-item">
            <span>
              Human Approval
            </span>

            <strong className="online">
              ✓ Enabled
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;