import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import Home from './Home'
import Tasks from './Tasks'
import ProtectedRoute from './ProtectedRoute'
// import Tasks from './TasksWeb'

export default function RouterPage() {
  return (
    <Router>
        <Routes>
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/tasks/:projectId'
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

            {/* <Route path='*' element={<NotFound/>} /> */}
        </Routes>
     </Router>
  )
}