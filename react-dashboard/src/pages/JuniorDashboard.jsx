import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const githubUsername = 'hyuckino';

  useEffect(() => {
    const fetchRepos = async () => {
      const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);
      setRepos(response.data);
    };
    fetchRepos();
  }, []);

  const handleRepoSelect = async (repoName) => {
    setSelectedRepo(repoName);
    const response = await axios.get(`https://api.github.com/repos/${githubUsername}/${repoName}/commits`);
    setCommits(response.data);
    setSelectedCommits([]);
    setShowForm(false);
    setSelectedCommitDetail(null);
    setReviewResult('');
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

  const handleSubmitDocument = () => {
    console.log('제출할 데이터:', {
      repo: selectedRepo,
      commits: selectedCommits,
      ...formData
    });
    alert('문서가 제출되었습니다 (모의 시나리오).');
    setShowForm(false);
  };

  const handleViewCommitDetail = async (sha) => {
    const response = await axios.get(`https://api.github.com/repos/${githubUsername}/${selectedRepo}/commits/${sha}`);
    setSelectedCommitDetail(response.data);
    setReviewResult('');
  };

  const handleReviewCode = async () => {
    if (!selectedCommitDetail || !selectedCommitDetail.files) return;
    const diffText = selectedCommitDetail.files.map(f => f.patch).filter(Boolean).join('\n\n');
    setReviewResult('리뷰 중입니다...');
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "당신은 코드 리뷰어입니다. 사용자로부터 Git diff 내용을 받으면, 코드 스타일, 오류 가능성, 개선 아이디어를 제공합니다."
            },
            {
              role: "user",
              content: `다음은 코드 변경사항입니다:\n\n${diffText}`
            }
          ],
          temperature: 0.4
        })
      });
      const data = await response.json();
      setReviewResult(data.choices?.[0]?.message?.content || '리뷰 결과가 없습니다.');
    } catch (err) {
      setReviewResult('❌ 리뷰 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">초급 개발자 대시보드</h1>

        <div className="box">
          <h2 className="subtitle">📦 내 GitHub 레포지토리</h2>
          <div className="buttons">
            {repos.map(repo => (
              <button
                key={repo.id}
                className={`button is-link is-light ${selectedRepo === repo.name ? 'is-selected' : ''}`}
                onClick={() => handleRepoSelect(repo.name)}
              >
                {repo.name}
              </button>
            ))}
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
                    {commits.map(commit => (
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
                    ))}
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
                    💬 ChatGPT 리뷰 요청 (OpenRouter)
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
      </section>
    </div>
  );
};

export default JuniorDashboard;
