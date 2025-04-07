import { useState, useEffect, useRef } from 'react'
import './App.css'


function App() {
  const [workTime, setWorkTime] = useState(1)
  const [breakTime, setBreakTime] = useState(5)

  const [timeLeft, setTimeLeft] = useState(workTime * 60)
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState('Pomodoro')
  const [minuteInput, setMinuteInput] = useState(String(workTime).padStart(2, '0'))
  const [secondInput, setSecondInput] = useState('00')

  

  const startAudioRef = useRef(null)
  const alarmAudioRef = useRef(null)
  const hasPlayedStartSound = useRef(false)

  useEffect(() => {
    startAudioRef.current?.load()
    alarmAudioRef.current?.load()
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  useEffect(() => {
    let interval = null

    if (isActive) {
      if (!hasPlayedStartSound.current && startAudioRef.current) {
        startAudioRef.current.currentTime = 0
        startAudioRef.current.play().catch(e => console.log("Autoplay bloqueado:", e))
        hasPlayedStartSound.current = true
      }

      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1)
      }, 1000)
    } else {
      hasPlayedStartSound.current = false
    }

    if (timeLeft === 0 && isActive) {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.currentTime = 0
        alarmAudioRef.current.play().catch(e => console.log("Erro ao tocar alarme:", e))
      }

      if (sessionType === 'Pomodoro') {
        setSessionType('Pausa')
        setTimeLeft(breakTime * 60)
      } else {
        setSessionType('Pomodoro')
        setTimeLeft(workTime * 60)
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, sessionType, workTime, breakTime])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setSessionType('Pomodoro')
    setTimeLeft(workTime * 60)
    hasPlayedStartSound.current = false
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0
    }
  }

  const updateTimes = () => {
    resetTimer()
    if (sessionType === 'Pomodoro') {
      setTimeLeft(workTime * 60)
    } else {
      setTimeLeft(breakTime * 60)
    }
  }

  useEffect(() => {
    if (!isActive) {
      setMinuteInput(String(Math.floor(timeLeft / 60)).padStart(2, '0'))
      setSecondInput(String(timeLeft % 60).padStart(2, '0'))
    }
  }, [timeLeft, isActive])

    

  return (
    <div className="app">
      <audio ref={startAudioRef} src="/audio/round1.mp3" preload="auto" />
      <audio ref={alarmAudioRef} src="/audio/fatality.mp3" preload="auto" />

      <div className="time-config">
        <div className="editable-time">
          <input
            type="text"
            value={String(Math.floor(timeLeft / 60)).padStart(2, '0')}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, '')
              if (raw.length > 2) raw = raw.slice(0, 2)
              const value = parseInt(raw) || 0
              setTimeLeft((value * 60) + (timeLeft % 60))
            }}
            disabled={isActive}
            maxLength={2}
          />
          <span>:</span>
          <input
            type="text"
            value={String(timeLeft % 60).padStart(2, '0')}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, '')
              if (raw.length > 2) raw = raw.slice(0, 2)
              const value = parseInt(raw) || 0
              setTimeLeft((Math.floor(timeLeft / 60) * 60) + value)
            }}
            disabled={isActive}
            maxLength={2}
          />
        </div>

        <div className="icon-buttons">
          <button className="icon-button" onClick={toggleTimer}>
            <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <button className="icon-button" onClick={resetTimer}>
            <i className="fas fa-rotate-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
