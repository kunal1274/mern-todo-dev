import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AuthProviderDetailed } from "./context/AuthContextDetailed.jsx";

// Sentry.init({
//   dsn: "https://fc4cb70344f9d6c3ea3ac1162e65fbe6@o4508682796531712.ingest.us.sentry.io/4508682802364416",
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.replayIntegration(),
//   ],
//   // Tracing
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//   tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProviderDetailed>
        <App />
      </AuthProviderDetailed>
    </Router>
  </StrictMode>
);
