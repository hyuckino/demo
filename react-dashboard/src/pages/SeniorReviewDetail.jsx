// src/pages/SeniorReviewDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, auth, signOut } from '../firebaseConfig'; // signOut 추가

const SeniorReviewDetail = () => {
  const { id } = useParams(); // 문서 ID
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // currentUser 상태 추가

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        setCurrentUser(user);
        if (user) {
            fetchDocument();
        } else {
            navigate('/login'); // 로그인되지 않았다면 로그인 페이지로 리디렉션
        }
    });
    return () => unsubscribe();
  }, [id, navigate]); // id, navigate를 의존성 배열에 추가

  const fetchDocument = async () => {
    try {
      const docRef = doc(db, "troubleshooting_documents", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDocument({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
        alert("문서를 찾을 수 없습니다.");
        navigate('/senior');
      }
    } catch (error) {
      console.error("문서 가져오기 오류:", error);
      alert("문서를 가져오는 데 실패했습니다.");
      navigate('/senior');
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (status, reviewContent = '') => {
    try {
      const docRef = doc(db, "troubleshooting_documents", id);
      await updateDoc(docRef, {
        status: status,
        reviewDetails: {
          reviewerUid: auth.currentUser?.uid,
          reviewerName: auth.currentUser?.displayName || auth.currentUser?.email,
          reviewedAt: new Date(),
          feedback: reviewContent,
        }
      });
      alert(`문서 ${id} ${status === 'approved' ? '승인' : '피드백 제출'} 완료!`);
      navigate('/senior');
    } catch (error) {
      console.error("문서 상태 업데이트 오류:", error);
      alert("문서 상태 업데이트에 실패했습니다.");
    }
  };

  const handleApprove = () => {
    if (window.confirm("이 문서를 승인하시겠습니까?")) {
      updateDocumentStatus('approved');
    }
  };

  const handleFeedback = () => {
    const feedbackText = prompt("피드백 내용을 입력해주세요:");
    if (feedbackText) {
      updateDocumentStatus('feedback_requested', feedbackText);
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


  if (loading) {
    return <section className="section"><div className="container"><p>문서 로드 중...</p></div></section>;
  }

  if (!document) {
    // currentUser가 있으나 document를 찾지 못했을 경우
    return <section className="section"><div className="container"><p>문서를 찾을 수 없습니다.</p></div></section>;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">문서 리뷰 - #{id}</h1>
        {currentUser && (
            <p className="has-text-right">
                환영합니다, {currentUser.displayName || currentUser.email}님!
                <button className="button is-small is-danger ml-2" onClick={handleLogout}>로그아웃</button>
            </p>
        )}

        <div className="box">
          <p><strong>작성자:</strong> {document.authorGithub}</p>
          <p><strong>제출일:</strong> {new Date(document.submittedAt.toDate()).toLocaleString()}</p>
          <p><strong>문제 요약:</strong> {document.summary}</p>
          <p><strong>원인 분석:</strong> {document.cause}</p>
          <p><strong>해결 방법:</strong> {document.solution}</p>
          <p><strong>기타:</strong> {document.notes}</p>
          {document.reviewDetails && document.status !== 'pending_review' && (
            <>
              <hr />
              <p><strong>리뷰어:</strong> {document.reviewDetails.reviewerName}</p>
              <p><strong>리뷰일:</strong> {new Date(document.reviewDetails.reviewedAt.toDate()).toLocaleString()}</p>
              <p><strong>결과:</strong> {document.status === 'approved' ? '✔ 승인' : '⚠️ 피드백 요청됨'}</p>
              {document.reviewDetails.feedback && <p><strong>피드백 내용:</strong> {document.reviewDetails.feedback}</p>}
            </>
          )}
        </div>

        {document.status === 'pending_review' && (
          <div className="field is-grouped">
            <p className="control">
              <button className="button is-success" onClick={handleApprove}>승인</button>
            </p>
            <p className="control">
              <button className="button is-warning" onClick={handleFeedback}>피드백 요청</button>
            </p>
          </div>
        )}
        <div className="mt-4">
          <button className="button is-light" onClick={() => navigate('/senior')}>목록으로</button>
        </div>
      </div>
    </section>
  );
};

export default SeniorReviewDetail;