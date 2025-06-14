import {useEffect, useState, useRef} from "react";
import {NavLink, useLocation} from "react-router-dom";
import "./header.scss";
import logoImg from "../../../assets/logo.svg";
import exitImg from "../../../assets/exit-2860.svg";
import {useAuth} from "../../../context/AuthContext.tsx";
import {UserProfileIcon} from "../profile-icon/UserProfileIcon.tsx";
import {DropdownMenu} from "../../ui/dropdown-menu/DropdownMenu.tsx";

export const Header = () => {
    const {authState, onLogout} = useAuth();
    const location = useLocation();
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const dropdownOptions = ["Ideas", "Start Idea", "Chats", "Forums"];

    const getInitialOption = () => {
        const path = location.pathname.toLowerCase();
        if (path === "/ideas") return "Ideas";
        if (path === "/ideas/start") return "Start Idea";
        if (path === "/chats") return "Chats";
        if (path === "/forums") return "Forums";
        return "SERVICES";
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuVisible(false);
            }
        };

        if (profileMenuVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuVisible]);

    const toggleProfileMenu = () => {
        setProfileMenuVisible((prevState) => !prevState);
    };

    const handleLogout = () => {
        if (!onLogout) return;
        onLogout();
    };

    return (
        <div className="header">
            <div id="logo">
                <img src={logoImg} alt="logo"/>
            </div>
            <div id="links">
                <NavLink to="/" className={location.pathname === "/home" ? "links-current" : ""}>
                    Home
                </NavLink>
                <NavLink
                    to={authState.isAuthenticated ? `/profile/${authState.userData?.username}` : "#"}
                    className={location.pathname.startsWith("/profile/") ? "links-current" : ""}
                >
                    My Profile
                </NavLink>
                <NavLink to="/about" className={location.pathname === "/about" ? "links-current" : ""}>
                    About Us
                </NavLink>

                <DropdownMenu
                    options={dropdownOptions}
                    placeholder={getInitialOption()}
                    onSelect={(e) => {
                        e === "Start Idea"
                            ? (window.location.href = `/ideas/start`)
                            : e === "Ideas" ? (window.location.href = `/ideas/all`)
                                : (window.location.href = `/${e.toLowerCase()}`);
                    }}
                />
            </div>
            <div id="user-pfp" onClick={toggleProfileMenu}>
                <UserProfileIcon username={authState.userData?.username!}/>
                {profileMenuVisible && (
                    <div className="dropdown-menu" ref={profileMenuRef}>
                        <NavLink to={`/profile/${authState.userData?.username}`}>My Profile</NavLink>
                        <button onClick={handleLogout}>
                            <p>Logout</p>
                            <img src={exitImg} alt=""/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};