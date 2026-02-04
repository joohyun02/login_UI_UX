import { useState, useRef } from "react";
import TextInput from "./components/TextInput";
import ErrorText from "./components/ErrorText";

function Login({ id, setId, setUserName, setPage }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const idRef = useRef(null);
  const pwRef = useRef(null);

  const API_BASE = "https://login-ui-ux.onrender.com";

  const handleLogin = async () => {
    setError("");

    if (!id.trim()) {
      setError("아이디를 입력하세요.");
      idRef.current?.focus();
      return;
    }

    if (!pw.trim()) {
      setError("비밀번호를 입력하세요.");
      pwRef.current?.focus();
      return;
    }

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id.trim(),
        password: pw.trim(),
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      setError(data.message);
      setPw("");
      pwRef.current?.focus();
      return;
    }

    // ✅ 로그인 성공
    localStorage.setItem("accessToken", data.access_token);
    setUserName(data.name);   // 🔥 서버에서 받은 이름 저장
    setPage("success");
    setPw("");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "300px" }}>
      <h2>로그인</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <TextInput
          ref={idRef}
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          hasError={!!error}
        />

        <TextInput
          ref={pwRef}
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          hasError={!!error}
        />

        <ErrorText message={error} />

        <button type="submit">로그인</button>
      </form>

      <button onClick={() => setPage("signup")}>회원가입</button>
    </div>
  );
}

export default Login;
