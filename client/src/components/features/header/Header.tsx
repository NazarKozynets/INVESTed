import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./header.scss";
import logoImg from "../../../assets/logo.svg";
import exitImg from "../../../assets/exit.svg";
import settingsImg from "../../../assets/settings.svg";
import { useAuth } from "../../../context/AuthContext.tsx";
import { UserProfileIcon } from "../profile-icon/UserProfileIcon.tsx";
import { DropdownMenu } from "../../ui/dropdown-menu/DropdownMenu.tsx";

const dropdownRoutes: Record<string, string> = {
  Ideas: "/ideas/all",
  "Start Idea": "/ideas/start",
  Forums: "/forums/all",
  "Create Forum": "/forums/create",
  Clients: "/clients",
};

export const Header = () => {
  const { authState, onLogout } = useAuth();
  const location = useLocation();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const profileButtonRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const username = authState.userData?.username;
  const userRole = authState.userData?.role ?? "Client";

  const clientDropdownOptions = [
    "Ideas",
    "Start Idea",
    "Forums",
    "Create Forum",
  ];
  const moderatorDropdownOptions = ["Ideas", "Forums"];
  const adminDropdownOptions = ["Ideas", "Forums", "Clients"];

  const getDropdownOptions = () => {
    switch (userRole) {
      case "Client":
        return clientDropdownOptions;
      case "Moderator":
        return moderatorDropdownOptions;
      case "Admin":
        return adminDropdownOptions;
    }
  };

  const getInitialOption = () => {
    const path = location.pathname.toLowerCase();
    if (path === "/ideas/all") return "Ideas";
    if (path === "/ideas/start") return "Start Idea";
    if (path === "/forums/all") return "Forums";
    if (path === "/forums/create") return "Create Forum";
    if (path === "/clients") return "Clients";
    return "Services";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
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
        <img src={logoImg} alt="logo" />
      </div>
      <div id="links">
        <NavLink
          to="/"
          className={location.pathname === "/home" ? "links-current" : ""}
        >
          Home
        </NavLink>
        <NavLink
          to={
            authState.isAuthenticated
              ? `/profile/${authState.userData?.username}`
              : "#"
          }
          className={
            location.pathname.startsWith("/profile/") ? "links-current" : ""
          }
        >
          My Profile
        </NavLink>
        <NavLink
          to="/about"
          className={location.pathname === "/about" ? "links-current" : ""}
        >
          About Us
        </NavLink>

        <DropdownMenu
          options={getDropdownOptions() || []}
          placeholder={getInitialOption()}
          onSelect={(e) => {
            const route = dropdownRoutes[e];
            if (route) window.location.href = route;
          }}
        />
      </div>
      <div id="user-pfp" ref={profileButtonRef} onClick={toggleProfileMenu}>
        {username && (
          <UserProfileIcon
            username={username}
            avatarUrl={authState.userData?.avatarUrl}
          />
        )}
        {profileMenuVisible && (
          <div className="dropdown-menu" ref={profileMenuRef}>
            <div className="dropdown-menu__item">
              <NavLink to={`/profile/${authState.userData?.username}`}>
                <div className="dropdown-menu__my-profile">
                  <p>My Profile</p>
                  <img src={settingsImg} alt="" />
                </div>
              </NavLink>
            </div>
            <div className="dropdown-menu__item">
              <button onClick={handleLogout}>
                <p>Logout</p>
                <img src={exitImg} alt="" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
