import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import NavbarLeft from "./NavbarLeft";
import NavbarRight from "./NavbarRight";
import "../styles/Navbar.css";
import { useWorkspace } from "./context/WorkspaceContext";

// Type definitions for API responses
interface Workspace {
  id: string;
  title: string;
}

interface Board {
  id: string;
  title: string;
  workspaceId: string;
  isStarred: boolean;
}

const Navbar: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { workspaces, setWorkspaces } = useWorkspace();
  const [starredBoardsByWorkspace, setStarredBoardsByWorkspace] = useState<{ [key: string]: Board[] }>({});
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);

  // Toggle dropdown menu
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  // Save the board to recent boards
  const saveToRecentlyBoards = (board: Board) => {
    const updatedBoards = [board, ...recentBoards].slice(0, 5); // Keep only the 5 most recent boards
    setRecentBoards(updatedBoards);
    localStorage.setItem("recentBoards", JSON.stringify(updatedBoards));
  };

  // Create axios instance with token
  const createAxiosInstance = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return null;
    }

    return axios.create({
      baseURL: "http://localhost:3000",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 1000,
    });
  };

  // Fetch workspaces from the API
  const fetchWorkspaces = async () => {
    const instance = createAxiosInstance();
    if (!instance) return;

    try {
      const response = await instance.get<Workspace[]>('http://localhost:3000/workspaces');
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  // Fetch starred boards for each workspace
  const fetchStarredBoards = async (workspaceId: string, workspace: Workspace) => {
    const instance = createAxiosInstance();
    if (!instance) return;

    try {
      const starredBoardResponse = await instance.get(`/workspaces/${workspace.id}/starred-boards`);
      const starredBoardsData = starredBoardResponse.data
        .filter((board: any) => board.isStarred)
        .map((board: any) => ({
          id: board.board.id,
          title: board.board.title,
        }));

      setStarredBoardsByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: starredBoardsData,
      }));
    } catch (error) {
      console.error("Error fetching starred boards for workspace", workspaceId, ":", error);
    }
  };

  // Create a new workspace
  const createWorkspace = async (title: string) => {
    const instance = createAxiosInstance();
    if (!instance) return;

    try {
      const response = await instance.post<Workspace>(
        'http://localhost:3000/workspaces',
        { title }
      );
      setWorkspaces((prevWorkspaces) => [...prevWorkspaces, response.data]);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  // Load recent boards from localStorage
  useEffect(() => {
    const recentBoardsFromStorage = localStorage.getItem("recentBoards");
    if (recentBoardsFromStorage) {
      setRecentBoards(JSON.parse(recentBoardsFromStorage));
    }
    fetchWorkspaces();
  }, []);

  // Fetch starred boards after workspaces are loaded
  useEffect(() => {
    if (workspaces.length > 0) {
      workspaces.forEach((workspace) => {
        fetchStarredBoards(workspace.id, workspace);
      });
    }
  }, [workspaces]);

  return (
    <div className="navbar">
      <NavbarLeft
        workspaces={workspaces}
        openDropdown={openDropdown}
        toggleDropdown={toggleDropdown}
        recentBoards={recentBoards}
        starredBoardsByWorkspace={starredBoardsByWorkspace}
        saveToRecentlyBoards={saveToRecentlyBoards}
        navigate={navigate}
        showCreateWorkspaceForm={showCreateWorkspaceForm}
        setShowCreateWorkspaceForm={setShowCreateWorkspaceForm}
        createWorkspace={createWorkspace}
      />
      <NavbarRight
        user={user}
        logout={logout}
        navigate={navigate}
        openDropdown={openDropdown}
        toggleDropdown={toggleDropdown}
      />
    </div>
  );
};

export default Navbar;
