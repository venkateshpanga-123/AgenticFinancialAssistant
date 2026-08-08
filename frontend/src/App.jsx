import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Transactions from "./pages/Transactions";
import Analysis from "./pages/Analysis";
import RiskFraud from "./pages/RiskFraud";
import Approvals from "./pages/Approvals";
import Audit from "./pages/Audit";

function App() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* PROTECTED */}

      <Route element={<ProtectedRoute />}>

        <Route element={<Layout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/tickets"
            element={<Tickets />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/analysis"
            element={<Analysis />}
          />

          <Route
            path="/risk"
            element={<RiskFraud />}
          />

          <Route
            path="/approvals"
            element={<Approvals />}
          />

          <Route
            path="/audit"
            element={<Audit />}
          />

        </Route>

      </Route>


      {/* DEFAULT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;