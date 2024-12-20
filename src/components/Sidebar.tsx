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
  FaRegClock,
  FaHome,
  FaStar,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import '../styles/Sidebar.css';

export const Sidebar = () => {
  const [showWorkspaceDetails, setShowWorkspaceDetails] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('boards');
  const [activeWorkspace, setActiveWorkspace] = useState<number | null>(null);
  const [workspaces, setWorkspaces] = useState<{ id: number; title: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<{ [workspaceId: number]: { id: string; title: string }[] }>({});
  const [workspaceTitleEdit, setWorkspaceTitleEdit] = useState<string>('');
  const [starredBoards, setStarredBoards] = useState<{ [workspaceId: number]: { id: string; title: string }[] }>({});
  const [showCreateBoardForm, setShowCreateBoardForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);
  const navigate = useNavigate();
  const instance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || activeWorkspace === null) return; // Do not create if the title is empty or no workspace is selected

    try {
      const response = await instance.post(`/boards`, {
        title: newBoardTitle,
        workspaceId: activeWorkspace,
      });

      // Update the boards state to include the new board
      setBoards((prevBoards) => ({
        ...prevBoards,
        [activeWorkspace]: [...(prevBoards[activeWorkspace] || []), response.data],
      }));

      // Clear the input and hide the form
      setNewBoardTitle('');
      setShowCreateBoardForm(false);
    } catch (error) {
      console.error('Failed to create board', error);
      setError('Failed to create board');
    }
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/boards/${boardId}`); // Navigate to the board detail page
  };

  // Fetch workspaces and their boards
  useEffect(() => {
    const fetchWorkspacesAndBoards = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        navigate('/login');
        return;
      }

      try {
        const workspaceResponse = await instance.get('/workspaces');
        setWorkspaces(workspaceResponse.data);

        const boardsData: { [workspaceId: number]: { id: string; title: string }[] } = {};
        const starredBoardsData: { [workspaceId: number]: { id: string; title: string }[] } = {};

        for (let workspace of workspaceResponse.data) {
          const boardResponse = await instance.get(`/workspaces/${workspace.id}/boards`);
          boardsData[workspace.id] = boardResponse.data;

          const starredBoardResponse = await instance.get(`/workspaces/${workspace.id}/starred-boards`);
          starredBoardsData[workspace.id] = starredBoardResponse.data
            .filter((board: { isStarred: boolean; board: { id: string; title: string } }) => board.isStarred)
            .map((board: { isStarred: boolean; board: { id: string; title: string } }) => ({
              id: board.board.id,
              title: board.board.title,
            }));
        }

        setBoards(boardsData);
        setStarredBoards(starredBoardsData);
      } catch (error) {
        console.error('Failed to fetch workspaces or boards', error);
        setError('Failed to fetch workspaces or boards');
      }
    };

    fetchWorkspacesAndBoards();
  }, [navigate]);

  const toggleWorkspaceDetails = () => {
    setShowWorkspaceDetails((prevState) => !prevState);
  };

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    navigate(`/${menu}`);
  };

  const toggleWorkspaceBoards = (workspaceId: number) => {
    setActiveWorkspace((prevState) => (prevState === workspaceId ? null : workspaceId));
  };

  const toggleStarred = async (workspaceId: number, boardId: string, isStarred: boolean) => {
    try {
      const url = `http://localhost:3000/boards/${boardId}/${isStarred ? 'unstar' : 'star'}`;
      await instance.patch(url);

      const updatedBoard = boards[workspaceId]?.find((board) => board.id === boardId);
      if (!updatedBoard) {
        console.error('Board not found in the workspace');
        return;
      }

      setStarredBoards((prevStarredBoards) => ({
        ...prevStarredBoards,
        [workspaceId]: isStarred
          ? prevStarredBoards[workspaceId]?.filter((board) => board.id !== boardId) || []
          : [
            ...(prevStarredBoards[workspaceId] || []),
            { id: boardId, title: updatedBoard.title },
          ],
      }));
    } catch (error) {
      console.error('Failed to update starred state:', error);
    }
  };

  const handleWorkspaceDelete = async () => {
    if (activeWorkspace === null) return;

    try {
      await instance.delete(`/workspaces/${activeWorkspace}`);
      setWorkspaces((prev) => prev.filter((workspace) => workspace.id !== activeWorkspace));
      setActiveWorkspace(null);
      setSelectedMenu('boards');
    } catch (error) {
      console.error('Failed to delete workspace', error);
      setError('Failed to delete workspace');
    }
  };
  const handleWorkspaceTitleUpdate = async () => {
    if (activeWorkspace === null || !workspaceTitleEdit.trim()) return;
    try {
      const response = await instance.patch(`/workspaces/${activeWorkspace}`, {
        title: workspaceTitleEdit,
      });
      setWorkspaces((prev) =>
        prev.map((workspace) =>
          workspace.id === activeWorkspace ? { ...workspace, title: response.data.title } : workspace
        )
      );
      setWorkspaceTitleEdit('');
    } catch (error) {
      console.error('Failed to update workspace title', error);
      setError('Failed to update workspace title');
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceTitle.trim()) return; // Do not create if the title is empty

    try {
      const response = await instance.post('/workspaces', {
        title: newWorkspaceTitle,
      });

      // Add the new workspace to the state
      setWorkspaces((prevWorkspaces) => [...prevWorkspaces, response.data]);

      // Clear the input field
      setNewWorkspaceTitle('');
    } catch (error) {
      console.error('Failed to create workspace', error);
      setError('Failed to create workspace');
    }
  };
  return (
    <div className="layout">
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
      <div className="recent-section">
        {selectedMenu === 'home' && (
          <div>
            <h3 className="section-title">
              <FaHome className="icon" /> Welcome to Trello
            </h3>
            <p>Your workspace content or dashboard goes here!</p>
            {/* Recently Viewed Section */}
            <h3 className="section-title">
              <FaRegClock className="icon" /> Recently Viewed
            </h3>
            <ul className="recent-list">
              <p>No recent boards available.</p>
            </ul>
            <div className="starred-boards">
              <h4>⭐ Starred Boards</h4>
              <ul>
                {Object.values(starredBoards).flat().map((board) => (
                  <li key={board.id} className="board-item">
                    <span>{board.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Create Workspace Button */}
            <div className="create-workspace">
              <button onClick={() => setShowCreateWorkspaceForm(true)}>Create Workspace</button>
            </div>

            {/* Create Workspace Modal */}
            {showCreateWorkspaceForm && (
              <div className="create-workspace-modal">
                <div className="modal-content">
                  <h4>Create New Workspace</h4>
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
        )}

        {selectedMenu === 'board' && (
          <div>
            {/* Recently Viewed Section */}
            <h3 className="section-title">
              <FaRegClock className="icon" /> Recently Viewed
            </h3>
            <ul className="recent-list">
              <p>No recent boards available.</p>
            </ul>
            <div className="starred-boards">
              <h4>⭐ Starred Boards</h4>
              <ul>
                {Object.values(starredBoards).flat().map((board) => (
                  <li key={board.id} className="board-item">
                    <span>{board.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Create Board Button */}
            <div className="create-board">
              <button onClick={() => setShowCreateBoardForm(true)}>Create Board</button>
            </div>

            {/* Create Board Modal */}
            {showCreateBoardForm && (
              <div className="create-board-modal">
                <div className="modal-content">
                  <h4>Create New Board</h4>
                  <input
                    type="text"
                    placeholder="Enter board title"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                  />
                  <div className="modal-buttons">
                    <button onClick={handleCreateBoard}>Create</button>
                    <button onClick={() => setShowCreateBoardForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {selectedMenu === 'boards' && activeWorkspace !== null && (
          <>
            {/* Recently Viewed Section */}
            <h3 className="section-title">
              <FaRegClock className="icon" /> Recently Viewed
            </h3>
            <ul className="recent-list">
              <p>No recent boards available.</p>
            </ul>

            {/* Boards in Active Workspace Section */}
            <div className="workspace-section">
              <h3 className="section-title">
                Boards in {workspaces.find((workspace) => workspace.id === activeWorkspace)?.title}
              </h3>

              {/* Workspace Boards List */}
              <div className="workspace-list">
                {boards[activeWorkspace] && boards[activeWorkspace].length > 0 ? (
                  <ul className="board-list">
                    {boards[activeWorkspace].map((board) => (
                      <li key={board.id} className="board-item" onClick={() => handleBoardClick(board.id)} style={{ cursor: 'pointer' }}>
                        <span>{board.title}</span>
                        <FaStar
                          onClick={() =>
                            toggleStarred(
                              activeWorkspace,
                              board.id,
                              starredBoards[activeWorkspace]?.some((b) => b.id === board.id)
                            )
                          }
                          className={`star-icon ${starredBoards[activeWorkspace]?.some((b) => b.id === board.id) ? 'starred' : ''
                            }`}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No boards available in this workspace</p>
                )}
              </div>

              {/* Create Board Button */}
              <div className="create-board">
                <button onClick={() => setShowCreateBoardForm(true)}>Create Board</button>
              </div>

              {/* Create Board Modal */}
              {showCreateBoardForm && (
                <div className="create-board-modal">
                  <div className="modal-content">
                    <h4>Create New Board</h4>
                    <input
                      type="text"
                      placeholder="Enter board title"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                    />
                    <div className="modal-buttons">
                      <button onClick={handleCreateBoard}>Create</button>
                      <button onClick={() => setShowCreateBoardForm(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}


        {selectedMenu === 'favorites' && activeWorkspace !== null && (
          <>
            <h3 className="section-title">
              <FaHeart className="icon" /> Starred Boards
            </h3>
            <div className="workspace-list">
              {starredBoards[activeWorkspace] && starredBoards[activeWorkspace].length > 0 ? (
                <ul className="board-list">
                  {starredBoards[activeWorkspace].map((board) => (
                    <li key={board.id} className="board-item">
                      <span>{board.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No starred boards in this workspace</p>
              )}
            </div>
          </>
        )}
        {selectedMenu === 'settings' && activeWorkspace !== null && (
          <div className="settings-section">
            <h3 className="section-title">
              <FaTasks className="icon" /> Manage Workspace
            </h3>
            <div className="settings-actions">
              <div className="update-workspace">
                <input
                  type="text"
                  value={workspaceTitleEdit}
                  onChange={(e) => setWorkspaceTitleEdit(e.target.value)}
                  placeholder="Update workspace title"
                />
                <button onClick={handleWorkspaceTitleUpdate}>
                  <FaEdit /> Update
                </button>
              </div>
              <div className="delete-workspace">
                <button onClick={handleWorkspaceDelete}>
                  <FaTrash /> Delete Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
