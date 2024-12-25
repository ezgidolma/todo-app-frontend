import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaChevronDown,
  FaChevronUp,
  FaClipboard,
  FaTasks,
  FaFolderOpen,
  FaHeart,
  FaHome,
} from 'react-icons/fa';
import '../styles/Sidebar.css';
import { useWorkspace } from './context/WorkspaceContext';

interface Workspace {
  id: string;
  title: string;
}

interface SidebarProps {
  activeWorkspace: string | null;
  setActiveWorkspace: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
  selectedMenu: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  setActiveWorkspace,
  setSelectedMenu,
  selectedMenu,
}) => {
  const { workspaces, setWorkspaces } = useWorkspace();
  const [showWorkspaceDetails, setShowWorkspaceDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: 'https://seashell-app-2wf3u.ondigitalocean.app',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get<Workspace[]>('/workspaces');
        setWorkspaces(response.data);
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
        setError('An error occurred while fetching workspaces. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchWorkspaces();
  }, []);
  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    navigate(`/${menu}`);
  };

  const toggleWorkspaceDetails = () => {
    setShowWorkspaceDetails((prevState) => !prevState);
  };

  const toggleWorkspaceBoards = (workspaceId: string) => {
    setActiveWorkspace((prevState) => (prevState === workspaceId ? null : workspaceId));
  };

  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => handleMenuClick('board')} className={selectedMenu === 'board' ? 'active' : ''}>
          <FaClipboard className="icon" /> Boards
        </li>
        <li onClick={() => handleMenuClick('home')} className={selectedMenu === 'home' ? 'active' : ''}>
          <FaHome className="icon" /> Home
        </li>
        <li onClick={toggleWorkspaceDetails} className="workspace">
          <FaTasks className="icon" /> Workspaces
          {showWorkspaceDetails ? <FaChevronUp className="chevron" /> : <FaChevronDown className="chevron" />}
        </li>

        {showWorkspaceDetails && (
          <div className="workspace-details">
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              workspaces.map((workspace) => (
                <div key={workspace.id}>
                  <div className="workspace-header" onClick={() => toggleWorkspaceBoards(workspace.id)}>
                    <FaFolderOpen className="icon" />
                    {workspace.title}
                    {activeWorkspace === workspace.id ? <FaChevronUp className="chevron" /> : <FaChevronDown className="chevron" />}
                  </div>
                  {activeWorkspace === workspace.id && (
                    <ul className="workspace-menu">
                      <li onClick={() => handleMenuClick('boards')} className={selectedMenu === 'boards' ? 'active' : ''}>
                        <FaFolderOpen className="icon" /> Boards
                      </li>
                      <li onClick={() => handleMenuClick('favorites')} className={selectedMenu === 'favorites' ? 'active' : ''}>
                        <FaHeart className="icon" /> Favorites
                      </li>
                      <li onClick={() => handleMenuClick('settings')} className={selectedMenu === 'settings' ? 'active' : ''}>
                        <FaTasks className="icon" /> Settings
                      </li>
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </ul>
    </div>
  );
};

