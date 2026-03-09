import { NavLink } from "react-router";
import Person from "../assets/person.svg";
import Home from "../assets/home.svg";

import ProfileBadge from "./ProfileBadge";

import "../styles/header.css";

function Header({ showHomeIcon }: { showHomeIcon?: boolean; }) {
    return (
        <header>
            {showHomeIcon && <NavLink to="/home"><img className="home-icon" src={Home} alt="Home Icon" /></NavLink>}
            <h1>GymBw VTechnik</h1>
            <ProfileBadge />
        </header>
    )
}

export default Header