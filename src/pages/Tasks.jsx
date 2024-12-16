"use client"
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TasksMobile from './TasksMobile';
import TasksWeb from './TasksWeb';

export default function Tasks() {
    const navigate = useNavigate();
  // const [session, setSession] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 768); // Change the breakpoint as per your needs
        };
    
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);
  return (
    <div>
      {isMobile ? <TasksMobile /> : <TasksWeb />}
    </div>
  )
}
