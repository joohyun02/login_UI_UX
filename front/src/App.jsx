import { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [page, setPage] = useState("login");
  const [id, setId] = useState("");
  const [userName, setUserName] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setUserName(data.name);
      setPage("success");
    })
    .catch(() => {
      localStorage.removeItem("accessToken");
    });
}, [API_BASE, setUserName, setPage]);


  if (page === "login") {
    return (
      <Login
        id={id}
        setId={setId}
        setUserName={setUserName}
        setPage={setPage}
      />
    );
  }

  if (page === "signup") {
    return <Signup setPage={setPage} />;
  }

  if (page === "success") {
    return (
      <div style={{ padding: "40px" }}>
        <h1>{userName}님 환영합니다.</h1>
        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            setId("");
            setUserName("");
            setPage("login");
          }}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return null;
}

export default App;
