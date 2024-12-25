import React, { useState } from 'react';
import { FaRegClock, FaStar, FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import '../styles/MainContext.css';

interface Workspace {
  id: string;
  title: string;
}

interface Board {
  id: string;
  title: string;
}

interface MainContentProps {
  selectedMenu: string;
  activeWorkspace: string | null;
  workspaces: Workspace[];
  boards: Record<string, Board[]>;
  starredBoards: Record<string, Board[]>;
  handleBoardClick: (boardId: string) => void;
  handleCreateBoard: () => void;
  setNewBoardTitle: (title: string) => void;
  newBoardTitle: string;
  showCreateBoardForm: boolean;
  setShowCreateBoardForm: (show: boolean) => void;
   setActiveWorkspace: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>; // setSelectedMenu eklendi
  workspaceTitleEdit: string;
  setWorkspaceTitleEdit: (title: string) => void;
  handleCreateWorkspace: () => void;
  newWorkspaceTitle: string;
  showCreateWorkspaceForm: boolean;
  setShowCreateWorkspaceForm: (show: boolean) => void;
  handleWorkspaceDelete: (workspaceId: string) => Promise<void>;

  handleWorkspaceTitleUpdate: (workspaceId: string, newTitle: string) => Promise<void>;

  setNewWorkspaceTitle: (title: string) => void;
  toggleStarred: (workspaceId: string, boardId: string, isStarred: boolean) => Promise<void>;
}

export const MainContent: React.FC<MainContentProps> = ({
  selectedMenu,
  activeWorkspace,
  workspaces,
  boards,
  starredBoards,
  handleBoardClick,
  handleCreateBoard,
  setNewBoardTitle,
  newBoardTitle,
  showCreateBoardForm,
  setShowCreateBoardForm,
  handleWorkspaceTitleUpdate,
  workspaceTitleEdit,
  setWorkspaceTitleEdit,
  handleWorkspaceDelete,
  handleCreateWorkspace,
  newWorkspaceTitle,
  showCreateWorkspaceForm,
  setShowCreateWorkspaceForm,
  setNewWorkspaceTitle,
  toggleStarred,
}) => {
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);  // Aktif board state'i

  // @ts-ignore
  const handleBoardSelect = (boardId: string) => {
    const selectedBoard = boards[activeWorkspace!].find(board => board.id === boardId);
    setActiveBoard(selectedBoard || null);  // Aktif board'ı set et
  };

  // Board detaylarını render etmek için
  const renderBoardDetails = () => {
    if (!activeBoard) return null;

    return (
      <div className="board-details">
        <h3>Board Details</h3>
        <h4>{activeBoard.title}</h4>
        {/* Burada board ile ilgili daha fazla detay ekleyebilirsiniz */}
      </div>
    );
  };

  // Render modals
  const renderCreateBoardModal = () =>
    showCreateBoardForm && (
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
            <button
              onClick={() => {
                if (!newBoardTitle.trim()) {
                  alert('Board title cannot be empty!');
                  return;
                }
                handleCreateBoard();
              }}
            >
              Create
            </button>
            <button onClick={() => setShowCreateBoardForm(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );

  // Render workspace boards
  const renderBoards = (boardsToRender: Board[]) => (
    <div className="workspace-list">
      {boardsToRender.length ? (
        <ul className="board-list grid-layout">
          {boardsToRender.map((board) => {
            const isCurrentlyStarred =
              activeWorkspace && starredBoards[activeWorkspace]?.some((b) => b.id === board.id);
            return (
              <li key={board.id} className="board-item" onClick={() => handleBoardClick(board.id)}>
                <span>{board.title}</span>
                <FaStar
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStarred(activeWorkspace!, board.id, !!isCurrentlyStarred);
                  }}
                  className={`star-icon ${isCurrentlyStarred ? 'starred' : ''}`}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No boards available.</p>
      )}
    </div>
  );

  // Render boards in a workspace
  const renderBoardsInWorkspace = () => (
    <div className="workspace-section">
      <h3 className="section-title">
        Boards in {workspaces.find((ws) => ws.id === activeWorkspace)?.title || 'Unknown Workspace'}
      </h3>
      {renderBoards(boards[activeWorkspace!] || [])}
      <div className="create-board">
        <button onClick={() => setShowCreateBoardForm(true)}>Create Board</button>
      </div>
      {renderCreateBoardModal()}
    </div>
  );

  // Render starred boards
  const renderFavoriteBoards = () => (
    <div className="workspace-section">
      <h3 className="section-title">Starred Boards</h3>
      {renderBoards(starredBoards[activeWorkspace!] || [])}
    </div>
  );

  // Render workspace settings
  const renderWorkspaceSettings = () => (
    <div>
      <h3>Workspace Settings</h3>
      <input
        type="text"
        placeholder="Workspace title"
        value={workspaceTitleEdit}
        onChange={(e) => setWorkspaceTitleEdit(e.target.value)}
      />
      <button
  onClick={() => {
    if (!workspaceTitleEdit.trim()) {
      alert('Workspace title cannot be empty!');
      return;
    }
    if (activeWorkspace) {
      handleWorkspaceTitleUpdate(activeWorkspace, workspaceTitleEdit);
    } else {
      alert('No active workspace selected!');
    }
  }}
>
  <FaEdit /> Update Title
</button>

<button
  onClick={() => {
    if (activeWorkspace) {
      const confirmation = window.confirm('Are you sure you want to delete this workspace?');
      if (confirmation) {
        handleWorkspaceDelete(activeWorkspace);
      }
    } else {
      alert('No active workspace selected!');
    }
  }}
>
  <FaTrash /> Delete Workspace
</button>

    </div>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'home':
        return (
          <div>
            <h3 className="section-title">
              <FaHome className="icon" /> Welcome to Trello
            </h3>
            <p>Your workspace content or dashboard goes here!</p>
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
            <div className="create-workspace">
              <button onClick={() => setShowCreateWorkspaceForm(true)}>Create Workspace</button>
            </div>
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
                    <button
                      onClick={() => {
                        if (!newWorkspaceTitle.trim()) {
                          alert('Workspace title cannot be empty!');
                          return;
                        }
                        handleCreateWorkspace();
                      }}
                    >
                      Create
                    </button>
                    <button onClick={() => setShowCreateWorkspaceForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'boards':
        if (activeBoard) {
          return (
            <div>
              <h3 className="section-title">Board Details</h3>
              {renderBoardDetails()}
            </div>
          );
        } else {
          return activeWorkspace ? renderBoardsInWorkspace() : <p>Please select a workspace.</p>;
        }
      case 'favorites':
        return renderFavoriteBoards();
      case 'settings':
        return renderWorkspaceSettings();
        case 'board': // Eklediğiniz içerik burada işleniyor
      return (
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
      );
      default:
        return null;
    }
  };

  return <div className="main-content">{renderContent()}</div>;
};
