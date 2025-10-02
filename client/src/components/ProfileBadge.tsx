import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router";

import PersonIcon from "../assets/person.svg";
import PersonIconDark from "../assets/person_dark.svg";
import ExitIcon from "../assets/exit.svg";

import "../styles/profile_badge.css";
import { AuthContext } from "./App";

function ProfileBadge() {
    const [ dropdownOpen, setDropdownOpen ] = useState(false);

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        document.body.addEventListener("click", () => setDropdownOpen(false))
    }, [])

    return (
        <div
            className="profile-badge"
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                setDropdownOpen(currOpen => !currOpen)
            }}
        >
            <img className="account-icon" src={PersonIcon} />
            {dropdownOpen && <div className="profile-badge-dropdown">
                <div>
                    <h2>Account</h2>
                </div>
                <div>
                    <img src={PersonIconDark} />
                    <NavLink to="/profile">Accounteinstellungen</NavLink>
                </div>
                <div className="logout">
                    <img src={ExitIcon} />
                    <NavLink to="/login" onClick={(e: React.MouseEvent) => { e.preventDefault(); logout() }}>Abmelden</NavLink>
                </div>
            </div>}
        </div>
    )
}

export default ProfileBadge