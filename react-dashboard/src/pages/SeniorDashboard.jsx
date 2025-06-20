import React from 'react';
import { Link } from 'react-router-dom';

const SeniorDashboard = () => (
  <section className="section">
    <div className="container">
      <h1 className="title">시니어 리뷰 대시보드</h1>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>작성자</th>
            <th>제목</th>
            <th>제출일</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>hyuckino</td>
            <td>API 오류 처리</td>
            <td>2025-06-19</td>
            <td>📝 리뷰 대기</td>
            <td><button className="button is-small is-primary"><Link to={`/senior/review/1`} className="button is-small is-primary">리뷰</Link></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default SeniorDashboard;