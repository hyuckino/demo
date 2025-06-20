import React from 'react';

const JuniorDocsStatus = () => (
  <section className="section">
    <div className="container">
      <h1 className="title">내 문서 제출 현황</h1>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>제목</th>
            <th>제출일</th>
            <th>상태</th>
            <th>리뷰 보기</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Login 오류 수정</td>
            <td>2025-06-20</td>
            <td>✅ 승인됨</td>
            <td><button className="button is-small is-light">보기</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default JuniorDocsStatus;