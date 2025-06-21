// src/pages/JuniorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db, collection, addDoc, query, where, getDocs, signOut } from '../firebaseConfig'; // signOut 추가
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const JuniorDashboard = () => {
  const [repos, setRepos] = useState([]);
  const [commits, setCommits] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    cause: '',
    solution: '',
    notes: ''
  });
  const [selectedCommitDetail, setSelectedCommitDetail] = useState(null);
  const [reviewResult, setReviewResult] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); // useNavigate 훅 사용

  // Firebase 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        // 이메일/비밀번호 로그인 시 displayName이 없을 수 있으므로, 기본값 제공
        const githubUsername = user.reloadUserInfo?.screenName || user.displayName || user.email.split('@')[0];
        fetchRepos(githubUsername); // GitHub API 호출에 사용할 사용자 이름
      } else {
        setCurrentUser(null);
        setRepos([]);
        setCommits([]);
        navigate('/login'); // 로그인되지 않았다면 로그인 페이지로 리디렉션
      }
    });
    return () => unsubscribe();
  }, [navigate]); // navigate를 의존성 배열에 추가

  const fetchRepos = async (username) => {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}/repos`);
      setRepos(response.data);
    } catch (error) {
      console.error("GitHub 레포지토리 가져오기 오류:", error);
      // GitHub 계정 연결이 안 되어 있거나 API 속도 제한 등의 경우
      alert(`GitHub 레포지토리를 가져오는 데 실패했습니다. GitHub 사용자 이름 (${username}) 확인 및 GitHub API 속도 제한을 확인해주세요.`);
      setRepos([]); // 오류 시 레포 목록 비우기
    }
  };

  const handleRepoSelect = async (repoName) => {
    setSelectedRepo(repoName);
    const githubUsername = currentUser?.reloadUserInfo?.screenName || currentUser?.displayName || currentUser?.email.split('@')[0];
    if (!githubUsername) {
        alert("GitHub 사용자 이름을 알 수 없어 커밋을 가져올 수 없습니다.");
        return;
    }
    try {
        const response = await axios.get(`https://api.github.com/repos/${githubUsername}/${repoName}/commits`);
        setCommits(response.data);
        setSelectedCommits([]);
        setShowForm(false);
        setSelectedCommitDetail(null);
        setReviewResult('');
    } catch (error) {
        console.error("커밋 목록 가져오기 오류:", error);
        alert("커밋 목록을 가져오는 데 실패했습니다. GitHub API 속도 제한 또는 리포지토리 접근 권한을 확인하세요.");
    }
  };

  const handleCheckboxChange = (sha) => {
    setSelectedCommits(prev =>
      prev.includes(sha) ? prev.filter(item => item !== sha) : [...prev, sha]
    );
  };

  const handleGenerateDocument = () => {
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDocument = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedRepo || selectedCommits.length === 0) {
      alert("레포지토리와 하나 이상의 커밋을 선택해야 합니다.");
      return;
    }

    try {
      await addDoc(collection(db, "troubleshooting_documents"), {
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email, // displayName이 없을 경우 email 사용
        authorGithub: currentUser.reloadUserInfo?.screenName || currentUser.email.split('@')[0], // GitHub 연동 안됐을 경우 email에서 추출
        repo: selectedRepo,
        commits: selectedCommits,
        summary: formData.summary,
        cause: formData.cause,
        solution: formData.solution,
        notes: formData.notes,
        status: 'pending_review',
        submittedAt: new Date(),
        reviewDetails: {}
      });
      alert('문서가 성공적으로 제출되었습니다!');
      setShowForm(false);
      setFormData({ summary: '', cause: '', solution: '', notes: '' });
      setSelectedCommits([]);
    } catch (error) {
      console.error("문서 제출 오류:", error);
      alert("문서 제출에 실패했습니다.");
    }
  };

  const handleViewCommitDetail = async (sha) => {
    const githubUsername = currentUser?.reloadUserInfo?.screenName || currentUser?.displayName || currentUser?.email.split('@')[0];
    if (!githubUsername) {
        alert("GitHub 사용자 이름을 알 수 없어 커밋 상세 정보를 가져올 수 없습니다.");
        return;
    }
    try {
      const response = await axios.get(`https://api.github.com/repos/${githubUsername}/${selectedRepo}/commits/${sha}`);
      setSelectedCommitDetail(response.data);
      setReviewResult('');
    } catch (error) {
      console.error("커밋 상세 정보 가져오기 오류:", error);
      alert("커밋 상세 정보를 가져오는 데 실패했습니다.");
    }
  };

  const handleReviewCode = async () => {
    if (!selectedCommitDetail || !selectedCommitDetail.files) return;

    const diffText = selectedCommitDetail.files.map(f => f.patch).filter(Boolean).join('\n\n');
    if (!diffText) {
      setReviewResult('리뷰할 diff 내용이 없습니다.');
      return;
    }

    setReviewResult('🧠 Gemini 2.5 Flash로 리뷰 중입니다...');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `당신은 코드 리뷰어입니다. 사용자로부터 Git diff 내용을 받으면 5줄 이내로 바뀐 내용만 설명합니다. 다음은 코드 변경사항입니다:\n\n${diffText}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setReviewResult(text || '리뷰 결과가 없습니다.');
    } catch (err) {
      console.error("Gemini API 호출 오류:", err);
      setReviewResult('❌ 코드 리뷰 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase 로그아웃
      alert('로그아웃 되었습니다.');
      navigate('/login'); // 로그인 페이지로 리디렉션
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">초급 개발자 대시보드</h1>
        {currentUser && (
            <p className="has-text-right">
                환영합니다, {currentUser.displayName || currentUser.email}님!
                <button className="button is-small is-danger ml-2" onClick={handleLogout}>로그아웃</button>
            </p>
        )}

        {currentUser ? (
          <>
            <div className="box">
              <h2 className="subtitle">📦 내 GitHub 레포지토리</h2>
              <div className="buttons">
                {repos.length > 0 ? (
                  repos.map(repo => (
                    <button
                      key={repo.id}
                      className={`button is-link is-light ${selectedRepo === repo.name ? 'is-selected' : ''}`}
                      onClick={() => handleRepoSelect(repo.name)}
                    >
                      {repo.name}
                    </button>
                  ))
                ) : (
                  <p>레포지토리를 불러오는 중이거나 GitHub 연동을 확인해주세요.</p>
                )}
              </div>
            </div>

            {selectedRepo && !showForm && (
              <div className="columns">
                <div className="column is-two-thirds">
                  <div className="box">
                    <h2 className="subtitle">📝 커밋 목록 - {selectedRepo}</h2>
                    <table className="table is-fullwidth">
                      <thead>
                        <tr>
                          <th>선택</th>
                          <th>메시지</th>
                          <th>작성자</th>
                          <th>날짜</th>
                          <th>자세히</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commits.length > 0 ? (
                          commits.map(commit => (
                            <tr key={commit.sha}>
                              <td>
                                <input
                                  type="checkbox"
                                  onChange={() => handleCheckboxChange(commit.sha)}
                                  checked={selectedCommits.includes(commit.sha)}
                                />
                              </td>
                              <td>{commit.commit.message}</td>
                              <td>{commit.commit.author.name}</td>
                              <td>{new Date(commit.commit.author.date).toLocaleString()}</td>
                              <td>
                                <button
                                  className="button is-small is-light"
                                  onClick={() => handleViewCommitDetail(commit.sha)}
                                >
                                  보기
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="5" className="has-text-centered">커밋이 없습니다.</td></tr>
                        )}
                      </tbody>
                    </table>
                    {selectedCommits.length > 0 && (
                      <button className="button is-primary mt-3" onClick={handleGenerateDocument}>
                        선택한 커밋으로 문서 생성하기
                      </button>
                    )}
                  </div>
                </div>

                {selectedCommitDetail && (
                  <div className="column">
                    <div className="box">
                      <h2 className="subtitle">🔍 커밋 상세 정보</h2>
                      <p><strong>SHA:</strong> {selectedCommitDetail.sha}</p>
                      <p><strong>메시지:</strong> {selectedCommitDetail.commit.message}</p>
                      <p><strong>작성자:</strong> {selectedCommitDetail.commit.author.name}</p>
                      <p><strong>이메일:</strong> {selectedCommitDetail.commit.author.email}</p>
                      <p><strong>날짜:</strong> {new Date(selectedCommitDetail.commit.author.date).toLocaleString()}</p>
                      <button className="button is-small is-info mt-3" onClick={handleReviewCode}>
                        💬 Gemini 2.5 Flash 리뷰 요청
                      </button>
                      <hr />
                      <h3 className="subtitle is-6">파일 변경 사항</h3>
                      {selectedCommitDetail.files && selectedCommitDetail.files.map(file => (
                        <div key={file.filename} className="mb-4">
                          <p><strong>{file.filename}</strong> ({file.status}) [+{file.additions}, -{file.deletions}]</p>
                          {file.patch ? (
                            <pre style={{ background: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
                              <code>{file.patch}</code>
                            </pre>
                          ) : (
                            <p className="has-text-grey">⚠️ diff 내용이 없습니다.</p>
                          )}
                        </div>
                      ))}
                      {reviewResult && (
                        <div className="mt-4">
                          <h3 className="subtitle is-6">🧠 코드 리뷰 결과</h3>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>{reviewResult}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showForm && (
              <div className="box">
                <h2 className="subtitle">🧾 트러블슈팅 문서 작성</h2>
                <div className="field">
                  <label className="label">문제 요약</label>
                  <div className="control">
                    <textarea className="textarea" name="summary" value={formData.summary} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">원인 분석</label>
                  <div className="control">
                    <textarea className="textarea" name="cause" value={formData.cause} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">해결 방법</label>
                  <div className="control">
                    <textarea className="textarea" name="solution" value={formData.solution} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">기타 메모</label>
                  <div className="control">
                    <textarea className="textarea" name="notes" value={formData.notes} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-success" onClick={handleSubmitDocument}>제출</button>
                  </div>
                  <div className="control">
                    <button className="button is-light" onClick={() => setShowForm(false)}>취소</button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="box has-text-centered">
            <p className="title is-4">로그인이 필요합니다.</p>
            <p className="subtitle is-6">이메일/비밀번호 또는 GitHub 로그인을 통해 서비스를 이용해 주세요.</p>
            <Link to="/login" className="button is-link is-large mt-4">로그인 페이지로 이동</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default JuniorDashboard;