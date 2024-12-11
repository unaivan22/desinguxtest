import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import Home from './Home'
import Tasks from './Tasks'

export default function RouterPage() {
  return (
    <Router>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path="/tasks/:projectId" element={<Tasks />} />

            {/* <Route path='*' element={<NotFound/>} /> */}
        </Routes>
     </Router>
  )
}