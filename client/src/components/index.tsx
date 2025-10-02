import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"
import { BrowserRouter } from "react-router"

import "../styles/index.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
)