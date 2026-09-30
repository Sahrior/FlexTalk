import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignGloveHome from "./components/Signglovehome";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import GuardianDashboard from "./pages/GuardianDashboard";
import PatientGuardians from "./pages/PatientGuardians";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

import { GloveProvider } from "./context/GloveContext";

import "./App.css";

function App() {
  return (
    <GloveProvider>
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<SignGloveHome />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/patient"
          element={<PatientDashboard />}
        />

        <Route
          path="/patient/guardians"
          element={<PatientGuardians />}
        />

        <Route
          path="/patient/messages"
          element={<Messages role="patient" />}
        />

        <Route
          path="/patient/profile"
          element={<Profile role="patient" />}
        />

        <Route
          path="/guardian"
          element={<GuardianDashboard />}
        />

        <Route
          path="/guardian/messages"
          element={<Messages role="guardian" />}
        />

        <Route
          path="/guardian/profile"
          element={<Profile role="guardian" />}
        />

      </Routes>
    </BrowserRouter>
    </GloveProvider>
  );
}

export default App;