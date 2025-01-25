import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from 'aws-amplify';
import config from '../amplify_outputs.json';

Amplify.configure(config);

// Comment out Amplify configuration for now
// import { Amplify } from "aws-amplify";
// import outputs from "../amplify_outputs.json";
// Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
