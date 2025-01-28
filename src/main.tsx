import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from 'aws-amplify';
import config from '../amplify_outputs.json';

// Configure Amplify with the outputs from the backend
Amplify.configure(config);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
