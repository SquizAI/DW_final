import React from "react";
import ReactDOM from "react-dom/client";
import MiamiMatrixRain3D from "../../frontend/src/components/MiamiMatrixRain3D";

const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MiamiMatrixRain3D />
    </div>
  );
};

const rootElement = document.getElementById("root") as HTMLElement | null;

if (!rootElement) {
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  ReactDOM.createRoot(newRoot as HTMLElement).render(<App />);
} else {
  ReactDOM.createRoot(rootElement).render(<App />);
} 