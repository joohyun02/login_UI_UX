import { useState, useRef } from "react";
import TextInput from "./components/TextInput";
import ErrorText from "./components/ErrorText";

function Signup({ setPage }) {
  const [newId, setNewId] = useState("");
  const [newPw, setNewPw] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [check, setCheck] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE;


  const [errors, setErrors] = useState({
    account: {},
    profile: {},
    verify: {},
  });

  const idRef = useRef(null);
  const pwRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const signup = async () => {
    const e = { account: {}, profile: {}, verify: {} };

    if (!newId.trim()) e.account.id = "아이디는 필수입니다.";
    if (!newPw.trim()) e.account.pw = "비밀번호는 필수입니다.";
    if (!userName.trim()) e.profile.name = "이름은 필수입니다.";

    if (!userEmail.trim()) {
      e.profile.email = "이메일은 필수입니다.";
    } else if (!userEmail.includes("@") || !userEmail.includes(".")) {
      e.profile.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!check) e.verify.agree = "약관에 동의해주세요.";

    if (
      Object.keys(e.account).length ||
      Object.keys(e.profile).length ||
      Object.keys(e.verify).length
    ) {
      setErrors(e);
      if (e.account.id) idRef.current?.focus();
      else if (e.account.pw) pwRef.current?.focus();
      else if (e.profile.name) nameRef.current?.focus();
      else if (e.profile.email) emailRef.current?.focus();
      return;
    }

    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newId,
        password: newPw,
        name: userName,
        email: userEmail,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      setErrors({ account: { id: data.message }, profile: {}, verify: {} });
      idRef.current?.focus();
      return;
    }

    setPage("login");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "320px" }}>
      <h2>회원가입</h2>

      <TextInput ref={idRef} placeholder="아이디" value={newId}
        onChange={(e) => setNewId(e.target.value)} hasError={!!errors.account.id} />
      <ErrorText message={errors.account.id} />

      <TextInput ref={pwRef} type="password"  maxLength = {50} placeholder="비밀번호" value={newPw}
        onChange={(e) => setNewPw(e.target.value)} hasError={!!errors.account.pw} />
      <ErrorText message={errors.account.pw} />

      <TextInput ref={nameRef} placeholder="이름" value={userName}
        onChange={(e) => setUserName(e.target.value)} hasError={!!errors.profile.name} />
      <ErrorText message={errors.profile.name} />

      <TextInput ref={emailRef} placeholder="이메일" value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)} hasError={!!errors.profile.email} />
      <ErrorText message={errors.profile.email} />

      <label>
        <input type="checkbox" checked={check}
          onChange={(e) => setCheck(e.target.checked)} />
        [필수] 약관 동의
      </label>
      <ErrorText message={errors.verify.agree} />

      <button onClick={signup}>회원가입</button>
      <button onClick={() => setPage("login")}>뒤로가기</button>
    </div>
  );
}

export default Signup;
