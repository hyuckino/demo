// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import JuniorDashboard from './pages/JuniorDashboard';
import JuniorDocsStatus from './pages/JuniorDocsStatus';
import SeniorDashboard from './pages/SeniorDashboard';
import SeniorReviewLog from './pages/SeniorReviewLog';
import SeniorReviewDetail from './pages/SeniorReviewDetail';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/junior" element={<JuniorDashboard />} />
      <Route path="/junior/docs" element={<JuniorDocsStatus />} />
      <Route path="/senior" element={<SeniorDashboard />} />
      <Route path="/senior/review-log" element={<SeniorReviewLog />} />
      <Route path="/senior/review/:id" element={<SeniorReviewDetail />} />
    </Routes>
  </Router>
);

export default App;