import { FaChevronDown, FaTrello } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useState } from "react";

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

interface NavbarLeftProps {
    workspaces: Workspace[];
    openDropdown: string | null;
    toggleDropdown: (dropdown: string) => void;
    recentBoards: Board[];
    starredBoardsByWorkspace: { [key: string]: Board[] };
    saveToRecentlyBoards: (board: Board) => void;
    navigate: ReturnType<typeof useNavigate>;
    showCreateWorkspaceForm: boolean;
    setShowCreateWorkspaceForm: React.Dispatch<React.SetStateAction<boolean>>;
    createWorkspace: (title: string) => void;
}

const NavbarLeft: React.FC<NavbarLeftProps> = ({
    workspaces,
    openDropdown,
    toggleDropdown,
    recentBoards,
    starredBoardsByWorkspace,
    navigate,
    showCreateWorkspaceForm,
    setShowCreateWorkspaceForm,
    createWorkspace,
}) => {
    const [newWorkspaceTitle, setNewWorkspaceTitle] = useState<string>("");

    const handleCreateWorkspace = () => {
        if (newWorkspaceTitle.trim()) {
            createWorkspace(newWorkspaceTitle);
            setNewWorkspaceTitle("");
            setShowCreateWorkspaceForm(false);
        } else {
            alert("Workspace title cannot be empty");
        }
    };

    const handleDropdownClick = (dropdown: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dropdown from closing
        toggleDropdown(dropdown);
    };

    return (
        <div className="navbar-left">
            <div className="navbar-icon-title" onClick={() => navigate("/home")}>
                <FaTrello className="navbar-icon" />
                <span className="navbar-title">Trello</span>
            </div>

            <div className="navbar-dropdown" onClick={(e) => handleDropdownClick("workspace", e)}>
                Workspace <FaChevronDown className="navbar-dropdown-icon" />
                {openDropdown === "workspace" && (
                    <div className="navbar-dropdown-content">
                        {workspaces.length > 0 ? (
                            workspaces.map((workspace) => (
                                <div
                                    key={workspace.id}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from closing
                                        navigate(`/workspace/${workspace.id}`);
                                    }}
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

            <div className="navbar-dropdown" onClick={(e) => handleDropdownClick("recently", e)}>
                Recently <FaChevronDown className="navbar-dropdown-icon" />
                {openDropdown === "recently" && (
                    <div className="navbar-dropdown-content">
                        {recentBoards.length > 0 ? (
                            recentBoards.map((board) => (
                                <div
                                    key={board.id}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from closing
                                        navigate(`/workspace/${board.workspaceId}/board/${board.id}`);
                                    }}
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
            {/* Workspace Başlığı */}
            <div className="navbar-dropdown-item workspace-title">
              {workspace.title}
            </div>
            
            {/* Starred Boards */}
            {starredBoardsByWorkspace[workspace.id] && starredBoardsByWorkspace[workspace.id].length > 0 ? (
              starredBoardsByWorkspace[workspace.id].map((board) => (
                <div
                  key={board.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from closing

                    navigate(`/workspace/${workspace.id}/board/${board.id}`);
                  }}
                  className="navbar-dropdown-item"
                >
                  {board.title}
                </div>
              ))
            ) : (
              // If no starred boards for the workspace
              <div className="navbar-dropdown-item">No starred boards</div>
            )}
          </div>
        ))
      ) : (
        // If no workspaces are available
        <div className="navbar-dropdown-item">No workspaces available</div>
      )}
    </div>
  )}
</div>


            <div className="create-workspace">
                <button onClick={() => setShowCreateWorkspaceForm(true)}>Create Workspace</button>
            </div>

            {showCreateWorkspaceForm && (
                <div className="create-workspace-modal">
                    <div className="modal-content">
                        <h4>Create Workspace</h4>
                        <input
                            type="text"
                            placeholder="Enter workspace title"
                            value={newWorkspaceTitle}
                            onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleCreateWorkspace}>Create</button>
                            <button onClick={() => setShowCreateWorkspaceForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavbarLeft;
