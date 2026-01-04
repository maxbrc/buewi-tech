import { useNavigate } from "react-router";

import PackageIcon from "../assets/package.svg";
import GroupIcon from "../assets/group.svg";
import ShieldIcon from "../assets/shield.svg";
import CalendarIcon from "../assets/calendar.svg";
import ManualIcon from "../assets/manual.svg";

import "../styles/dashboard.css";

function Dashboard() {
    const navigate = useNavigate()

    return (
        <>
            <h2>Dashboard</h2>
            <div className="modules">
                <div onClick={() => navigate("/inventory")}>
                    <img src={PackageIcon} />
                    <h3>Inventar</h3>
                </div>
                <div onClick={() => navigate("/borrowing")}>
                    <img src={GroupIcon} />
                    <h3>Ausleihportal</h3>
                </div>
                <div onClick={() => navigate("/resources")}>
                    <img src={ManualIcon} />
                    <h3>Anleitungen</h3>
                </div>
                <div onClick={() => navigate("/admin")}>
                    <img src={ShieldIcon} />
                    <h3>Admin Panel</h3>
                </div>
            </div>
        </>
    )
}

export default Dashboard