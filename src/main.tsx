import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const basename = (import.meta as any).env?.BASE_URL || "/";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter basename={basename}>
		<App />
	</BrowserRouter>
);
