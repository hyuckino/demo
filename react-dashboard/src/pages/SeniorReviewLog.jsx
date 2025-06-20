import React from 'react';

const SeniorReviewLog = () => (
  <section className="section">
    <div className="container">
      <h1 className="title">피드백 기록</h1>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>문서</th>
            <th>작성자</th>
            <th>리뷰일</th>
            <th>결과</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DB 이슈 해결</td>
            <td>hyuckino</td>
            <td>2025-06-15</td>
            <td>✔ 승인</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/junior" element={<JuniorDashboard />} />
      <Route path="/junior/docs" element={<JuniorDocsStatus />} />
      <Route path="/senior" element={<SeniorDashboard />} />
      <Route path="/senior/review-log" element={<SeniorReviewLog />} />
    </Routes>
  </Router>
);

export default SeniorReviewLog;
