import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePvP } from '../../hooks/usePvP';
import { useUser } from '../../hooks/useUser';
import { executeAndValidate } from '../../services/pistonCompiler';
import { convertDbToPistonLanguage } from '../../utils/languageMapping';
import SuccessNotification from '../../components/SuccessNotification';
import AlertNotification from '../../components/AlertNotification';
import '../../assets/CSS/pvpbattle.css';

const BATTLE_DURATION = 300;
const PREPARATION_TIME = 5;
const LANGUAGE_OPTIONS = ['python', 'java', 'c', 'cpp'];

export default function PvPBattle() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { userStats } = useUser();
  const { getMatchById, getProblemById, submitCode } = usePvP();

  const [match, setMatch] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('Output will display here...');
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(BATTLE_DURATION);
  const [prepTime, setPrepTime] = useState(PREPARATION_TIME);
  const [battleStarted, setBattleStarted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);
  const [showErrorNotif, setShowErrorNotif] = useState(false);

  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const loadBattle = async () => {
      try {
        const matchData = await getMatchById(matchId);
        if (matchData) {
          setMatch(matchData);

          if (matchData.problemId) {
            const problemData = await getProblemById(matchData.problemId);
            if (problemData) {
              setProblem(problemData);
              if (problemData.solutionTemplate) {
                setCode(problemData.solutionTemplate);
              }
            }
          }
        }
      } catch (err) {
        setErrorMessage('Failed to load battle');
        setShowErrorNotif(true);
      }
    };

    loadBattle();
  }, [matchId, getMatchById, getProblemById]);

  useEffect(() => {
    if (prepTime > 0) {
      const timer = setTimeout(() => setPrepTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!battleStarted) {
      setBattleStarted(true);
    }
  }, [prepTime, battleStarted]);

  useEffect(() => {
    if (!battleStarted) return;
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [battleStarted, timeRemaining]);

  useEffect(() => {
    if (!battleStarted || !matchId) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updatedMatch = await getMatchById(matchId);
        if (updatedMatch) {
          setMatch(updatedMatch);

          if (updatedMatch.status === 'completed') {
            clearInterval(pollingIntervalRef.current);
            const userIsWinner = updatedMatch.winnerId === userStats?.user?.userId;
            setSuccessMessage(userIsWinner ? 'Victory!' : 'Defeated!');
            setShowSuccessNotif(true);

            setTimeout(() => {
              navigate('/pvp/lobby');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(pollingIntervalRef.current);
  }, [battleStarted, matchId, getMatchById, userStats, navigate]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running...');

    try {
      if (!problem || !problem.testCases) {
        setOutput('Error: No test cases available');
        setIsRunning(false);
        return;
      }

      const pistonLang = convertDbToPistonLanguage(language);
      let testCases = problem.testCases;

      if (typeof testCases === 'string') {
        testCases = JSON.parse(testCases);
      }

      const result = await executeAndValidate(code, pistonLang, testCases);

      let outputText = '';
      if (result.allPassed) {
        outputText = 'All tests passed!\n';
      } else {
        outputText = `Tests passed: ${result.passedCount}/${result.totalTests}\n\n`;
      }

      outputText += result.detailedResults || result.output || 'Check your code!';
      setOutput(outputText);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (submitted) {
      setErrorMessage('You have already submitted');
      setShowErrorNotif(true);
      return;
    }

    try {
      setIsRunning(true);
      const result = await submitCode(matchId, code);
      if (result) {
        setSubmitted(true);
        setSuccessMessage('Code submitted successfully!');
        setShowSuccessNotif(true);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit code');
      setShowErrorNotif(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuitBattle = async () => {
    const confirmed = window.confirm('Quit battle? This will count as a loss.');
    if (confirmed) {
      navigate('/pvp/lobby');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!match || !problem) {
    return (
      <div className="pvp-battle-container">
        <div style={{ textAlign: 'center', padding: '40px', color: '#a0a0a0' }}>
          Loading battle...
        </div>
      </div>
    );
  }

  if (prepTime > 0) {
    return (
      <div className="pvp-battle-container">
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
          zIndex: 9999
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>
            Preparing for Battle
          </div>
          <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#4caf50', fontFamily: 'monospace', animation: 'pulse 1s infinite' }}>
            {prepTime}
          </div>
          <div style={{ fontSize: '1rem', color: '#a0a0a0' }}>
            Get ready to code...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pvp-battle-container">
      <div className="pvp-battle-left">
        <div className="pvp-battle-header">
          <div className="pvp-player-header">
            <div className="pvp-player-header-avatar">
              {userStats?.user?.fullName?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="pvp-player-header-info">
              <h3>{userStats?.user?.fullName || 'You'}</h3>
              <p>XP: {userStats?.xp || 0}</p>
            </div>
          </div>
        </div>

        <div className="pvp-battle-timer">
          <div className={`pvp-countdown ${timeRemaining <= 60 ? timeRemaining <= 30 ? 'danger' : 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="pvp-battle-timer-text">Time Remaining</div>
        </div>

        <div className="pvp-battle-problem">
          <div className="pvp-problem-title">{problem.title}</div>
          <div className="pvp-problem-description">
            <h4>Description</h4>
            <p>{problem.problemDescription}</p>
            {problem.testCases && (
              <>
                <h4>Test Cases</h4>
                <code>{typeof problem.testCases === 'string' ? problem.testCases : JSON.stringify(problem.testCases, null, 2)}</code>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pvp-battle-right">
        <div className="pvp-battle-header">
          <div className="pvp-player-header">
            <div className="pvp-player-header-avatar">
              {match?.player2Id ? 'O' : '?'}
            </div>
            <div className="pvp-player-header-info">
              <h3>{match?.player2Id ? 'Opponent' : 'Waiting'}</h3>
              <p>{match?.player2Id ? 'In Battle' : 'Connecting...'}</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderTop: '1px solid #3a4a5a' }}>
          <div className="pvp-editor-section">
            <div className="pvp-language-selector">
              <span className="pvp-language-label">Language:</span>
              <select
                className="pvp-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={submitted}
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="pvp-editor-wrapper">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                disabled={submitted}
              />
            </div>

            <div className="pvp-output-section">
              <div className="pvp-output-title">Output</div>
              <div className="pvp-output-content">{output}</div>
            </div>

            <div className="pvp-editor-buttons">
              <button
                className="pvp-btn-run"
                onClick={handleRunCode}
                disabled={isRunning || submitted || timeRemaining === 0}
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                className="pvp-btn-submit"
                onClick={handleSubmitCode}
                disabled={isRunning || submitted || timeRemaining === 0}
              >
                {submitted ? 'Submitted' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessNotif && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccessNotif(false)}
        />
      )}

      {showErrorNotif && (
        <AlertNotification
          message={errorMessage}
          onClose={() => setShowErrorNotif(false)}
        />
      )}
    </div>
  );
}
