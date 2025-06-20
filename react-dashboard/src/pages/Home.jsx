import { Link } from 'react-router-dom';

const Home = () => (
  <section className="section">
    <div className="container">
      <h1 className="title">트러블슈팅 자동화 시스템</h1>
      <div className="buttons">
        <Link to="/login" className="button is-link">GitHub 로그인</Link>
        <Link to="/junior" className="button is-info">초급 대시보드</Link>
        <Link to="/senior" className="button is-primary">시니어 대시보드</Link>
      </div>
    </div>
  </section>
);

export default Home;
