import React, { useEffect, useState } from "react";
import axios, { AxiosInstance } from "axios";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface List {
  id: string;
  title: string;
  todos: Todo[];
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface BoardDetailProps {
  boardId: string;
}

export const BoardDetail: React.FC<BoardDetailProps> = ({ boardId }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Create axios instance with token
  const createAxiosInstance = (): AxiosInstance | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("Unauthorized: Please log in.");
      return null;
    }

    return axios.create({
      baseURL: "https://seashell-app-2wf3u.ondigitalocean.app",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 1000,
    });
  };

  // Fetch lists
  const fetchLists = async (instance: AxiosInstance) => {
    try {
      const response = await instance.get<List[]>("/lists", { params: { boardId } });
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists:", error);
      setError("Failed to fetch lists.");
    }
  };

  // Fetch tasks
  const fetchTasks = async (instance: AxiosInstance) => {
    try {
      const response = await instance.get<Task[]>("/tasks", { params: { boardId } });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const instance = createAxiosInstance();
      if (!instance) return;

      await Promise.all([fetchLists(instance), fetchTasks(instance)]);
      setLoading(false);
    };

    fetchData();
  }, [boardId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Board Details for ID: {boardId}</h1>

      {/* Lists Section */}
      <h2>Lists</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {lists.map((list) => (
          <div
            key={list.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              width: "300px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>{list.title}</h3>
            <ul>
              {list.todos.map((todo) => (
                <li key={todo.id}>
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                    }}
                  >
                    {todo.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Tasks Section */}
      <h2>Tasks</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              margin: "10px 0",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                fontWeight: "bold",
              }}
            >
              {task.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
