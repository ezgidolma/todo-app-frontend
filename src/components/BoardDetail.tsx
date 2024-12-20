import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/BoardDetail.css';

interface Board {
  title: string;
  // Diğer board özellikleri eklenebilir
}

export const BoardDetail = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);

  const instance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Authorization başlığını ekle
    },
  });

  useEffect(() => {
    const fetchBoardDetail = async () => {
      try {
        const response = await instance.get(`/boards/${boardId}`); // instance üzerinden istek
        setBoard(response.data);
      } catch (error: any) {
        console.error(error); // Hata mesajını konsola yazdırarak daha fazla bilgi edin
        setError('Failed to fetch board details');
      }
    };

    fetchBoardDetail();
  }, [boardId]);

  if (error) return <div>{error}</div>;

  return (
    <div>
      {board ? (
        <div>
          <h1>{board.title}</h1>
          {/* Daha fazla board detayı buraya eklenebilir */}
        </div>
      ) : (
        <div>Loading...</div> // Yükleniyor durumu
      )}
    </div>
  );
};
