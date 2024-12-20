import { FaTrello, FaSearch, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "../styles/Navbar.css";
import axios from "axios";

export const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [starredBoardsByWorkspace, setStarredBoardsByWorkspace] = useState<any>({});
  const [recentBoards, setRecentBoards] = useState<any[]>([]);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleHomeClick = () => {
    navigate("/home");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const saveToRecentlyBoards = (board: any) => {
    const updatedBoards = [board, ...recentBoards];
    if (updatedBoards.length > 5) updatedBoards.pop();
    setRecentBoards(updatedBoards);
    localStorage.setItem("recentBoards", JSON.stringify(updatedBoards));
  };

  const fetchWorkspaces = async () => {
    const instance = axios.create({
      baseURL: 'http://localhost:3000',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      timeout: 1000,
    });

    try {
      const response = await instance.get('/workspaces');
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchStarredBoards = async (workspaceId: string, workspace: any) => {
    const instance = axios.create({
      baseURL: 'http://localhost:3000',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      timeout: 1000,
    });

    try {
      const starredBoardResponse = await instance.get(`/workspaces/${workspace.id}/starred-boards`);
      const starredBoardsData = starredBoardResponse.data
        .filter((board: any) => board.isStarred)
        .map((board: any) => ({
          id: board.board.id,
          title: board.board.title,
        }));

      setStarredBoardsByWorkspace((prev: any) => ({
        ...prev,
        [workspaceId]: starredBoardsData,
      }));
    } catch (error) {
      console.error('Error fetching starred boards for workspace', workspaceId, ':', error);
    }
  };

  useEffect(() => {
    const recentBoardsFromStorage = localStorage.getItem("recentBoards");
    if (recentBoardsFromStorage) {
      setRecentBoards(JSON.parse(recentBoardsFromStorage));
    }
    fetchWorkspaces();
    
    // Set interval to refresh workspaces and starred boards every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchWorkspaces();
      if (workspaces.length > 0) {
        workspaces.forEach((workspace) => {
          fetchStarredBoards(workspace.id, workspace);
        });
      }
    }, 5000); 

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [workspaces]); // Empty dependency to fetch data only on mount and at the interval

  useEffect(() => {
    if (workspaces.length > 0) {
      workspaces.forEach((workspace) => {
        fetchStarredBoards(workspace.id, workspace);
      });
    }
  }, [workspaces]);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-icon-title" onClick={handleHomeClick}>
          <FaTrello className="navbar-icon" />
          <span className="navbar-title">Trello</span>
        </div>

        {/* Workspace Dropdown */}
        <div className="navbar-dropdown" onClick={() => toggleDropdown("workspace")}>
          Workspace <FaChevronDown className="navbar-dropdown-icon" />
          {openDropdown === "workspace" && (
            <div className="navbar-dropdown-content">
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => navigate(`/workspace/${workspace.id}`)}
                    className="navbar-dropdown-item"
                  >
                    {workspace.title}
                  </div>
                ))
              ) : (
                <div>No workspaces available</div>
              )}
            </div>
          )}
        </div>

        {/* Recently Dropdown */}
        <div className="navbar-dropdown" onClick={() => toggleDropdown("recently")}>
          Recently <FaChevronDown className="navbar-dropdown-icon" />
          {openDropdown === "recently" && (
            <div className="navbar-dropdown-content">
              {recentBoards.length > 0 ? (
                recentBoards.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/workspace/${board.workspaceId}/board/${board.id}`)}
                    className="navbar-dropdown-item"
                  >
                    {board.title}
                  </div>
                ))
              ) : (
                <div>No recent boards</div>
              )}
            </div>
          )}
        </div>

        {/* Starred Dropdown */}
        <div className="navbar-dropdown" onClick={() => toggleDropdown("starred")}>
          Starred <FaChevronDown className="navbar-dropdown-icon" />
          {openDropdown === "starred" && (
            <div className="navbar-dropdown-content">
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <div key={workspace.id}>
                    <div className="navbar-dropdown-item workspace-title">
                      {workspace.title}
                    </div>
                    {starredBoardsByWorkspace[workspace.id] && starredBoardsByWorkspace[workspace.id].length > 0 ? (
                      starredBoardsByWorkspace[workspace.id].map((board: any) => (
                        <div
                          key={board.id}
                          onClick={() => {
                            saveToRecentlyBoards(board);
                            navigate(`/workspace/${workspace.id}/board/${board.id}`);
                          }}
                          className="navbar-dropdown-item"
                        >
                          {board.title}
                        </div>
                      ))
                    ) : (
                      <div>No starred boards</div>
                    )}
                  </div>
                ))
              ) : (
                <div>No workspaces available</div>
              )}
            </div>
          )}
        </div>

        <button className="navbar-button">Create</button>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <FaSearch className="navbar-icon" />
          <input type="text" placeholder="Search" />
        </div>

        {/* User Dropdown */}
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
    </div>
  );
};
