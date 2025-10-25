import { useEffect, useState } from "react";

export const FetchDataEffect = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    let ignore = false;

    async function fetchPosts() {
      try {
        setError(null);

        const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
          signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log(data);
        if (!ignore) {
          setPosts(data);
        }
      } catch (err) {
        if (!ignore && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return <div>{posts[0].title}</div>;
};
