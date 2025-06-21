// src/pages/JuniorDocsStatus.jsx
import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, auth, signOut } from '../firebaseConfig'; // signOut 추가
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가

const JuniorDocsStatus = () => {
  const [documents, setDocuments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        fetchDocuments(user.uid);
      } else {
        setDocuments([]);
        navigate('/login'); // 로그인되지 않았다면 로그인 페이지로 리디렉션
      }
    });
    return () => unsubscribe();
  }, [navigate]); // navigate를 의존성 배열에 추가

  const fetchDocuments = async (uid) => {
    try {
      const q = query(collection(db, "troubleshooting_documents"), where("authorUid", "==", uid));
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docsData);
    } catch (error) {
      console.error("문서 현황 가져오기 오류:", error);
      alert("문서 현황을 가져오는 데 실패했습니다.");
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
        <h1 className="title">내 문서 제출 현황</h1>
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
                <th>제목</th>
                <th>제출일</th>
                <th>상태</th>
                <th>리뷰 보기</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.summary}</td>
                    <td>{new Date(doc.submittedAt.toDate()).toLocaleString()}</td>
                    <td>
                      {doc.status === 'pending_review' && '📝 리뷰 대기'}
                      {doc.status === 'approved' && '✅ 승인됨'}
                      {doc.status === 'feedback_requested' && '⚠️ 피드백 요청됨'}
                    </td>
                    <td>
                      <Link to={`/senior/review/${doc.id}`} className="button is-small is-light">보기</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="has-text-centered">제출된 문서가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="box has-text-centered">
            <p className="title is-4">로그인이 필요합니다.</p>
            <p className="subtitle is-6">내 문서 현황을 확인하려면 로그인해 주세요.</p>
            <Link to="/login" className="button is-link is-large mt-4">로그인 페이지로 이동</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default JuniorDocsStatus;