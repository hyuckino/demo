// src/pages/SeniorReviewDetail.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SeniorReviewDetail = () => {
  const { id } = useParams(); // 예: 문서 ID
  const navigate = useNavigate();

  const handleApprove = () => {
    alert(`문서 ${id} 승인 완료!`);
    navigate('/senior');
  };

  const handleFeedback = () => {
    alert(`문서 ${id} 피드백 제출 완료!`);
    navigate('/senior');
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">문서 리뷰 - #{id}</h1>

        <div className="box">
          <p><strong>문제 요약:</strong> 로그인 실패 시 로딩 오류 발생</p>
          <p><strong>원인 분석:</strong> useEffect에서 비동기 오류 처리 미흡</p>
          <p><strong>해결 방법:</strong> try-catch 블록 추가</p>
          <p><strong>기타:</strong> 관련 PR: <a href="https://github.com/example/repo/pull/123" target="_blank">#123</a></p>
        </div>

        <div className="field is-grouped">
          <p className="control">
            <button className="button is-success" onClick={handleApprove}>승인</button>
          </p>
          <p className="control">
            <button className="button is-warning" onClick={handleFeedback}>피드백 요청</button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SeniorReviewDetail;
