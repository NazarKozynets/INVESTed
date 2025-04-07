import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./header.scss";
import logoImg from "../../../assets/logo.svg";
import exitImg from "../../../assets/exit-2860.svg";
import {useAuth} from "../../../context/AuthContext.tsx";

export const Header = () => {
    const { onLogout } = useAuth();
    const location = useLocation();

    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(prevState => !prevState);
    };

    const handleLogout = () => {
        if (!onLogout) return;

        onLogout();
    }

    return (
        <div className="header">
            <div id="logo">
                <img src={logoImg} alt="logo" />
            </div>
            <div id="links">
                <NavLink to="/" className={location.pathname === "/home" ? "links-current" : ""}>
                    Home
                </NavLink>
                <NavLink to="/about" className={location.pathname === "/about" ? "links-current" : ""}>
                    About Us
                </NavLink>
                <NavLink to="/services" className={location.pathname === "/services" ? "links-current" : ""}>
                    Services
                </NavLink>
                <NavLink to="/profile" className={location.pathname === "/profile" ? "links-current" : ""}>
                    My Profile
                </NavLink>
            </div>
            <div id="user-pfp" onClick={toggleMenu}>
                <img src={logoImg} alt="user-profile" />
                {menuVisible && (
                    <div className="dropdown-menu">
                        <NavLink to="/profile">My Profile</NavLink>
                        <button onClick={handleLogout}>
                            <p>Logout</p>
                            <img src={exitImg} alt=''/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
