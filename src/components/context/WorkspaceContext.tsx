import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Workspace {
  id: string;
  title: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  setActiveWorkspace: React.Dispatch<React.SetStateAction<string | null>>;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspaceTitle: (id: string, title: string) => void;
  deleteWorkspace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  const addWorkspace = (workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
  };

  const updateWorkspaceTitle = (id: string, title: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === id ? { ...workspace, title } : workspace
      )
    );
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces((prev) => prev.filter((workspace) => workspace.id !== id));
    if (activeWorkspace === id) {
      setActiveWorkspace(null);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setWorkspaces,
        setActiveWorkspace,
        addWorkspace,
        updateWorkspaceTitle,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
