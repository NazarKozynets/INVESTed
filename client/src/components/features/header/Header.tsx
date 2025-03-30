import {NavLink, useLocation} from "react-router-dom";
import "./header.scss";
import logoImg from "../../../assets/logo.svg";

export const Header = () => {
    const location = useLocation();

    return (
        <div className="header">
            <div id="logo">
                <img src={logoImg} alt="logo"/>
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
                <NavLink to="/profile" className={location.pathname === "/my-profile" ? "links-current" : ""}>
                    My Profile
                </NavLink>
            </div>
            <div id="user-pfp">
                <img src={logoImg} alt="logo"/>
            </div>
        </div>
    );
};
