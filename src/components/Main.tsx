import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { BoardDetail } from './BoardDetail';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Main.css';

interface Workspace {
  id: string;
  title: string;
}

interface Board {
  id: string;
  title: string;
}

export const Main = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [boards, setBoards] = useState<Record<string, Board[]>>({});
  const [starredBoards, setStarredBoards] = useState<Record<string, Board[]>>({});
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showCreateBoardForm, setShowCreateBoardForm] = useState(false);
  const [workspaceTitleEdit, setWorkspaceTitleEdit] = useState('');
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: 'https://seashell-app-2wf3u.ondigitalocean.app',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  useEffect(() => {
    const fetchWorkspacesAndBoards = async () => {
      try {
        const workspaceResponse = await instance.get<Workspace[]>('/workspaces');
        setWorkspaces(workspaceResponse.data);

        const boardsData: Record<string, Board[]> = {};
        const starredBoardsData: Record<string, Board[]> = {};

        for (const workspace of workspaceResponse.data) {
          const [boardResponse, starredBoardResponse] = await Promise.all([
            instance.get<Board[]>(`/workspaces/${workspace.id}/boards`),
            instance.get<{ isStarred: boolean; board: Board }[]>(
              `/workspaces/${workspace.id}/starred-boards`
            ),
          ]);

          boardsData[workspace.id] = boardResponse.data;
          starredBoardsData[workspace.id] = starredBoardResponse.data
            .filter((board) => board.isStarred)
            .map((board) => board.board);
        }

        setBoards(boardsData);
        setStarredBoards(starredBoardsData);
      } catch (err) {
        console.error('Failed to fetch workspaces or boards:', err);
        setError('Failed to fetch workspaces or boards');
      }
    };

    fetchWorkspacesAndBoards();
  }, []);

  const handleBoardClick = (boardId: string) => {
    navigate(`/boards/${boardId}`);
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || activeWorkspace === null) return;

    try {
      const response = await instance.post<Board>('/boards', {
        title: newBoardTitle,
        workspaceId: activeWorkspace,
      });

      setBoards((prevBoards) => ({
        ...prevBoards,
        [activeWorkspace]: [...(prevBoards[activeWorkspace] || []), response.data],
      }));

      setNewBoardTitle('');
      setShowCreateBoardForm(false);
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board');
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceTitle.trim()) return;

    setIsLoading(true);

    try {
      const response = await instance.post<Workspace>('/workspaces', {
        title: newWorkspaceTitle,
      });

      setWorkspaces((prev) => [...prev, response.data]);
      setNewWorkspaceTitle('');
      setShowCreateWorkspaceForm(false);
      alert('Workspace created successfully!');
    } catch (err) {
      console.error('Failed to create workspace:', err);
      setError('Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStarred = async (
    workspaceId: string,
    boardId: string,
    isStarred: boolean
  ) => {
    try {
      const url = `https://seashell-app-2wf3u.ondigitalocean.app/boards/${boardId}/${isStarred ? 'unstar' : 'star'}`;
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

  const handleWorkspaceTitleUpdate = async (workspaceId: string, newTitle: string) => {
    try {
      const response = await instance.patch(`/workspaces/${workspaceId}`, { title: newTitle });
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.id === workspaceId ? { ...workspace, title: response.data.title } : workspace
        )
      );
    } catch (error) {
      console.error('Failed to update workspace title:', error);
      setError('Failed to update workspace title');
    }
  };

  const handleWorkspaceDelete = async (workspaceId: string) => {
    try {
      await instance.delete(`/workspaces/${workspaceId}`);
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.filter((workspace) => workspace.id !== workspaceId)
      );
      setBoards((prevBoards) => {
        const updatedBoards = { ...prevBoards };
        delete updatedBoards[workspaceId];
        return updatedBoards;
      });
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      setError('Failed to delete workspace');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        setSelectedMenu={setSelectedMenu}
        selectedMenu={selectedMenu}
      />
      <div className="main-container">
        {boardId ? (
          <BoardDetail boardId={boardId} />
        ) : (
          <MainContent
            selectedMenu={selectedMenu}
            setActiveWorkspace={setActiveWorkspace} // Eksik prop eklendi
            setSelectedMenu={setSelectedMenu} // Eksik prop eklendi
            activeWorkspace={activeWorkspace}
            workspaces={workspaces}
            boards={boards}
            starredBoards={starredBoards}
            handleBoardClick={handleBoardClick}
            handleCreateBoard={handleCreateBoard}
            setNewBoardTitle={setNewBoardTitle}
            newBoardTitle={newBoardTitle}
            showCreateBoardForm={showCreateBoardForm}
            setShowCreateBoardForm={setShowCreateBoardForm}
            handleWorkspaceTitleUpdate={handleWorkspaceTitleUpdate}
            workspaceTitleEdit={workspaceTitleEdit}
            setWorkspaceTitleEdit={setWorkspaceTitleEdit}
            handleWorkspaceDelete={handleWorkspaceDelete}
            handleCreateWorkspace={handleCreateWorkspace}
            newWorkspaceTitle={newWorkspaceTitle}
            showCreateWorkspaceForm={showCreateWorkspaceForm}
            setShowCreateWorkspaceForm={setShowCreateWorkspaceForm}
            setNewWorkspaceTitle={setNewWorkspaceTitle}
            toggleStarred={toggleStarred}
          />
        )}
      </div>
    </div>
  );
};

export default Main;
