// NavbarRight.js
import { FaSearch, FaUserCircle } from "react-icons/fa";
import "../styles/Navbar.css";

interface NavbarRightProps {
  user: any;  // `user` tipini doğru şekilde tanımlayın
  logout: () => void;
  navigate: (path: string) => void;
  openDropdown: string | null;
  toggleDropdown: (dropdown: string) => void;
}

const NavbarRight: React.FC<NavbarRightProps> = ({
  user,
  logout,
  navigate,
  openDropdown,
  toggleDropdown,
}) => {
  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar-right">
      <div className="navbar-search">
        <FaSearch className="navbar-icon" />
        <input type="text" placeholder="Search" />
      </div>

      <div className="navbar-dropdown" onClick={() => toggleDropdown("user")}>
        <FaUserCircle className="user-icon" />
        {openDropdown === "user" && (
          <div className="navbar-dropdown-content">
            {user && (
              <>
                <div>Welcome, {user.email}</div>
                <div onClick={handleLogoutClick}>Logout</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarRight;
