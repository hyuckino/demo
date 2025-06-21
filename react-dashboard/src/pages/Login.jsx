// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, // GitHub 로그인을 사용하지 않아도 필요하다면 유지
  githubProvider // GitHub 로그인을 사용하지 않아도 필요하다면 유지
} from '../firebaseConfig'; // Firebase import

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // 회원가입 모드 여부

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    try {
      if (isRegistering) {
        // 회원가입 로직
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입 성공! 이제 로그인할 수 있습니다.');
        setIsRegistering(false); // 회원가입 후 로그인 모드로 전환
        setEmail(''); // 입력 필드 초기화
        setPassword('');
      } else {
        // 로그인 로직
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/junior'); // 로그인 성공 후 초급 개발자 대시보드로 이동
      }
    } catch (error) {
      console.error("인증 오류:", error);
      let errorMessage = "인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "비밀번호가 틀렸습니다.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "등록되지 않은 이메일입니다.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "비밀번호는 6자 이상이어야 합니다.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "유효하지 않은 이메일 형식입니다.";
      }
      alert(`오류: ${errorMessage}`);
    }
  };

  // GitHub 로그인 버튼 (필요 없으면 제거해도 됩니다)
  const handleGitHubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      navigate('/junior');
    } catch (error) {
      console.error("GitHub 로그인 오류:", error);
      alert("GitHub 로그인에 실패했습니다. Firebase 설정과 GitHub OAuth 앱 설정을 확인해주세요.");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">{isRegistering ? '회원가입' : '로그인'}</h1>
        <p className="subtitle">이메일과 비밀번호로 {isRegistering ? '계정을 생성' : '로그인'} 해주세요.</p>

        <form onSubmit={handleEmailPasswordAuth}>
          <div className="field">
            <label className="label">이메일</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label className="label">비밀번호</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field is-grouped">
            <div className="control">
              <button type="submit" className="button is-link">
                {isRegistering ? '회원가입' : '로그인'}
              </button>
            </div>
            <div className="control">
              <button
                type="button"
                className="button is-light"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? '이미 계정이 있다면 로그인' : '계정이 없다면 회원가입'}
              </button>
            </div>
          </div>
        </form>

        {/* GitHub 로그인 버튼 (선택 사항: 필요 없다면 이 div 전체를 제거하세요) */}
        <div className="mt-5">
            <p className="subtitle">또는</p>
            <button className="button is-dark" onClick={handleGitHubLogin}>
                <span className="icon">
                    <i className="fab fa-github"></i>
                </span>
                <span>GitHub로 로그인 (기존 연동)</span>
            </button>
        </div>


        <div className="mt-5">
          <label className="label">역할 선택 (테스트용)</label>
          <div className="buttons">
            <Link to="/junior" className="button is-info">초급 개발자</Link>
            <Link to="/senior" className="button is-primary">시니어 개발자</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;