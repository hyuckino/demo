// src/pages/SeniorReviewLog.jsx
import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, auth, signOut } from '../firebaseConfig'; // signOut 추가
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가

const SeniorReviewLog = () => {
  const [reviewLogs, setReviewLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        fetchReviewLogs();
      } else {
        setReviewLogs([]);
        navigate('/login'); // 로그인되지 않았다면 로그인 페이지로 리디렉션
      }
    });
    return () => unsubscribe();
  }, [navigate]); // navigate를 의존성 배열에 추가

  const fetchReviewLogs = async () => {
    try {
      // 'approved' 또는 'feedback_requested' 상태의 문서 가져오기
      const q = query(collection(db, "troubleshooting_documents"),
        where("status", "in", ["approved", "feedback_requested"])
      );
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviewLogs(logsData);
    } catch (error) {
      console.error("피드백 기록 가져오기 오류:", error);
      alert("피드백 기록을 가져오는 데 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">피드백 기록</h1>
        {currentUser && (
            <p className="has-text-right">
                환영합니다, {currentUser.displayName || currentUser.email}님!
                <button className="button is-small is-danger ml-2" onClick={handleLogout}>로그아웃</button>
            </p>
        )}
        {currentUser ? (
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>문서</th>
                <th>작성자</th>
                <th>리뷰일</th>
                <th>결과</th>
                <th>상세보기</th>
              </tr>
            </thead>
            <tbody>
              {reviewLogs.length > 0 ? (
                reviewLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.summary}</td>
                    <td>{log.authorGithub}</td>
                    <td>{log.reviewDetails?.reviewedAt ? new Date(log.reviewDetails.reviewedAt.toDate()).toLocaleString() : 'N/A'}</td>
                    <td>
                      {log.status === 'approved' && '✔ 승인'}
                      {log.status === 'feedback_requested' && '⚠️ 피드백 요청됨'}
                    </td>
                    <td>
                      <Link to={`/senior/review/${log.id}`} className="button is-small is-light">보기</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="has-text-centered">피드백 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="box has-text-centered">
            <p className="title is-4">로그인이 필요합니다.</p>
            <p className="subtitle is-6">피드백 기록을 확인하려면 로그인해 주세요.</p>
            <Link to="/login" className="button is-link is-large mt-4">로그인 페이지로 이동</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SeniorReviewLog;