import { Link } from 'react-router-dom';

const Login = () => (
  <section className="section">
    <div className="container">
      <h1 className="title">GitHub 로그인</h1>
      <p className="subtitle">OAuth 연동을 진행해주세요.</p>
      <button className="button is-dark">
        <span className="icon">
          <i className="fab fa-github"></i>
        </span>
        <span>GitHub로 로그인</span>
      </button>

      <div className="mt-5">
        <label className="label">역할 선택</label>
        <div className="buttons">
          <Link to="/junior" className="button is-info">초급 개발자</Link>
          <Link to="/senior" className="button is-primary">시니어 개발자</Link>
        </div>
      </div>
    </div>
  </section>
);

export default Login;