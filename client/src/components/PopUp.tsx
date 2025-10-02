import { useContext } from "react";

import "../styles/popup.css";
import { PopupContext } from "./App";

function PopUp({ show, children }: { show: boolean; children: React.ReactNode; }) {
    const { closePopup } = useContext(PopupContext);

    return (
        show &&
        <div
            className="popup-overlay"
        >
            <div className="popup">
                {children}
            </div>
        </div>
    )
}

export default PopUp