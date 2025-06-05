import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './PAGES/Login';
import Signup from './PAGES/Signup';
import Home from './PAGES/Home';
import TextEditors from './components/TextEditors';
import ProtectedRoute from './components/ProtectedRoute';
import UserFiles from './PAGES/UserFiles';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<TextEditors />} />
        <Route path="/login" element={
          <ProtectedRoute isAuthPage={true}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute isAuthPage={true}>
            <Signup />
          </ProtectedRoute>
        } />
        <Route path="/files" element={<UserFiles />} />
      </Routes>
    </Router>
  )
}

export default App
