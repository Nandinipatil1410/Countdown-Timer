import React, { useState, useEffect, useRef } from 'react';
import './CountdownTimer.css';

const CountdownTimer = () => {
  const [duration, setDuration] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(Math.floor(duration / 60));
  const [editSeconds, setEditSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const circleRef = useRef(null);
  const containerRef = useRef(null);
  const circumference = 2 * Math.PI * 180; 

  useEffect(() => {
    const savedTimeLeft = localStorage.getItem('countdownTimeLeft');
    const savedDuration = localStorage.getItem('countdownDuration');
    
    if (savedDuration) {
      const savedDur = parseInt(savedDuration);
      setDuration(savedDur);
      setEditHours(Math.floor(savedDur / 3600));
      setEditMinutes(Math.floor((savedDur % 3600) / 60));
      setEditSeconds(savedDur % 60);
    }
    
    if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft));
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    let interval;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          if (newTime <= 0) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          
          localStorage.setItem('countdownTimeLeft', newTime.toString());
          return newTime;
        });
      }, 1000);
    }

    if (circleRef.current) {
      const offset = circumference - ((duration - timeLeft) / duration) * circumference;
      circleRef.current.style.strokeDashoffset = offset;
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, duration, circumference]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    localStorage.setItem('countdownIsActive', 'true');
    localStorage.setItem('countdownIsPaused', 'false');
  };

  const handlePause = () => {
    setIsPaused(true);
    localStorage.setItem('countdownIsPaused', 'true');
  };

  const handleResume = () => {
    setIsPaused(false);
    localStorage.setItem('countdownIsPaused', 'false');
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(true);
    setTimeLeft(duration);
    localStorage.setItem('countdownTimeLeft', duration.toString());
    localStorage.setItem('countdownIsActive', 'false');
    localStorage.setItem('countdownIsPaused', 'true');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditHours(Math.floor(timeLeft / 3600));
    setEditMinutes(Math.floor((timeLeft % 3600) / 60));
    setEditSeconds(timeLeft % 60);
  };

  const handleSaveEdit = () => {
    const newDuration = (editHours * 3600) + (editMinutes * 60) + editSeconds;
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsEditing(false);
    localStorage.setItem('countdownDuration', newDuration.toString());
    localStorage.setItem('countdownTimeLeft', newDuration.toString());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="countdown-container" ref={containerRef}>
      <button className="fullscreen-btn" onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
      
      <div className="timer-wrapper">
        <svg className="progress-ring" width="400" height="400">
          <circle
            className="progress-ring__circle"
            strokeWidth="10"
            fill="transparent"
            r="180"
            cx="200"
            cy="200"
          />
          <circle
            ref={circleRef}
            className="progress-ring__circle progress-ring__circle--progress"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            fill="transparent"
            r="180"
            cx="200"
            cy="200"
          />
        </svg>
        
        {isEditing ? (
          <div className="edit-container">
            <div className="time-input-group">
              <input
                type="number"
                min="0"
                max="23"
                value={editHours}
                onChange={(e) => setEditHours(parseInt(e.target.value) || 0)}
                className="time-input"
              />
              <span>h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={editMinutes}
                onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
                className="time-input"
              />
              <span>m</span>
              <input
                type="number"
                min="0"
                max="59"
                value={editSeconds}
                onChange={(e) => setEditSeconds(parseInt(e.target.value) || 0)}
                className="time-input"
              />
              <span>s</span>
            </div>
            <div className="edit-buttons">
              <button onClick={handleSaveEdit} className="btn save-btn">Save</button>
              <button onClick={handleCancelEdit} className="btn cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="timer-display" onClick={handleEdit}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="controls">
        {!isActive ? (
          <button className="btn start-btn" onClick={handleStart}>
            Start
          </button>
        ) : isPaused ? (
          <button className="btn resume-btn" onClick={handleResume}>
            Resume
          </button>
        ) : (
          <button className="btn pause-btn" onClick={handlePause}>
            Pause
          </button>
        )}
        
        <button className="btn reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default CountdownTimer;