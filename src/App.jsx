import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './PAGES/Login';
import Signup from './PAGES/Signup';
import Home from './PAGES/Home';
import TextEditor from './components/TextEditor';
import ProtectedRoute from './components/ProtectedRoute';
import UserFiles from './PAGES/UserFiles';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<TextEditor />} />
        <Route path="/login" element={
          <ProtectedRoute>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute>
            <Signup />
          </ProtectedRoute>
        } />
        <Route path="/files" element={<UserFiles />} />
      </Routes>
    </Router>
  )
}

export default App
