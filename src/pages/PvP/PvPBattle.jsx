import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePvP } from '../../hooks/usePvP';
import { useUser } from '../../hooks/useUser';
import { executeAndValidate } from '../../services/pistonCompiler';
import { convertDbToPistonLanguage } from '../../utils/languageMapping';
import SuccessNotification from '../../components/SuccessNotification';
import AlertNotification from '../../components/AlertNotification';
import CodeEditor from '../../components/CodeEditor';
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

  // Resizable state
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(35);
  const [outputPanelHeight, setOutputPanelHeight] = useState(35);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const containerRef = useRef(null);

  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const loadBattle = async () => {
      try {
        // If no matchId, skip loading from API (demo/design mode)
        if (!matchId) {
          setProblem({
            problemId: 'demo-1',
            title: 'Demo Problem',
            description: 'This is a demo battle interface',
            difficulty: 'medium',
            solutionTemplate: '# Write your code here\nprint("Hello World")'
          });
          setCode('# Write your code here\nprint("Hello World")');
          return;
        }

        console.log('[PvPBattle] Loading match:', matchId);
        const matchResult = await getMatchById(matchId);
        
        if (matchResult && matchResult.success) {
          const matchData = matchResult.data;
          setMatch(matchData);

          if (matchData.problemId) {
            console.log('[PvPBattle] Loading problem:', matchData.problemId);
            const problemData = await getProblemById(matchData.problemId);
            if (problemData) {
              setProblem(problemData);
              if (problemData.solutionTemplate) {
                setCode(problemData.solutionTemplate);
              }
            }
          }
        } else {
          setErrorMessage('Failed to load match data');
          setShowErrorNotif(true);
        }
      } catch (err) {
        console.error('Failed to load battle:', err);
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
        if (updatedMatch && updatedMatch.status === 'completed') {
          clearInterval(pollingIntervalRef.current);
          
          const currentUserId = userStats?.user?.userId;
          const isPlayer1 = match?.player1Id === currentUserId;
          const isWinner = updatedMatch.winnerId === currentUserId;
          const xpChange = isPlayer1 ? updatedMatch.xpChangeP1 : updatedMatch.xpChangeP2;
          
          if (isWinner) {
            setSuccessMessage(`Victory! +${xpChange || 20} XP`);
            setShowSuccessNotif(true);
          } else {
            setErrorMessage(`Defeated! ${xpChange || -5} XP`);
            setShowErrorNotif(true);
          }

          setTimeout(() => {
            navigate('/pvp/lobby');
          }, 3000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds for faster result detection

    return () => clearInterval(pollingIntervalRef.current);
  }, [battleStarted, matchId, match, getMatchById, userStats, navigate]);

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

    if (!matchId) {
      setErrorMessage('Match ID not found');
      setShowErrorNotif(true);
      return;
    }

    try {
      setIsRunning(true);
      
      // First validate code with test cases
      if (problem && problem.testCases) {
        const pistonLang = convertDbToPistonLanguage(language);
        let testCases = problem.testCases;

        if (typeof testCases === 'string') {
          testCases = JSON.parse(testCases);
        }

        const result = await executeAndValidate(code, pistonLang, testCases);
        
        if (!result.allPassed) {
          setErrorMessage(`Tests not all passed! Only ${result.passedCount}/${result.totalTests} passed.`);
          setShowErrorNotif(true);
          setIsRunning(false);
          return;
        }
      }

      // If tests passed, submit code
      console.log('[PvPBattle] Submitting code to match:', matchId);
      const submitResult = await submitCode(matchId, code);
      
      if (submitResult.success) {
        setSubmitted(true);
        setSuccessMessage('Code submitted! Waiting for opponent...');
        setShowSuccessNotif(true);
        // Don't redirect yet - let polling detect winner
      } else {
        setErrorMessage(submitResult.message || 'Failed to submit code');
        setShowErrorNotif(true);
      }
    } catch (err) {
      console.error('Submit code error:', err);
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

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingHorizontal && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        
        if (newWidth > 20 && newWidth < 70) {
          setLeftPanelWidth(newWidth);
        }
      }
      
      if (isResizingVertical && containerRef.current) {
        const editorPanel = document.querySelector('.pvp-editor-panel');
        if (editorPanel) {
          const rect = editorPanel.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const editorHeight = rect.height;
          
          // Calculate code editor height (from top of panel to cursor)
          const codeEditorHeight = (relativeY / editorHeight) * 100;
          
          if (codeEditorHeight > 20 && codeEditorHeight < 80) {
            setOutputPanelHeight(100 - codeEditorHeight);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
      setIsResizingVertical(false);
    };

    if (isResizingHorizontal || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingHorizontal, isResizingVertical]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!problem) {
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
    <div className="pvp-screen-container">
      {/* Header */}
      <header className="pvp-header" style={{ display: isFullscreenEditor ? 'none' : 'block' }}>
        <div className="header-left">
          <button className="back-btn" onClick={handleQuitBattle} title="Quit Battle">
            ←
          </button>
          <h1 className="battle-title">The Knight's Duel</h1>
        </div>
      </header>

      {/* Main Container */}
      <div className={`pvp-main ${isFullscreenEditor ? 'fullscreen-editor' : ''}`} ref={containerRef}>
        {/* LEFT: Problem Description & Players */}
        <div className="pvp-problem-panel" style={{ display: isFullscreenEditor ? 'none' : 'block', flex: `0 0 ${leftPanelWidth}%` }}>
          {/* Players Header */}
          <div className="pvp-players-section">
            <div className="pvp-player-item">
              <div className="pvp-player-box">
                <div className="pvp-player-header">
                  <div className="pvp-player-avatar">
                    {userStats?.user?.fullName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="pvp-player-info">
                    <h3>{userStats?.user?.fullName || 'You'}</h3>
                    <p>XP: {userStats?.xp || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="pvp-timer-box">
              <div className={`pvp-timer ${timeRemaining <= 60 ? timeRemaining <= 30 ? 'danger' : 'warning' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="pvp-timer-label">Time</div>
            </div>

            <div className="pvp-player-item">
              <div className="pvp-player-box">
                <div className="pvp-player-header">
                  <div className="pvp-player-avatar opponent">
                    {match?.player2Id ? 'O' : '?'}
                  </div>
                  <div className="pvp-player-info">
                    <h3>{match?.player2Id ? 'Opponent' : 'Waiting'}</h3>
                    <p>{match?.player2Id ? 'In Battle' : 'Connecting...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="pvp-problem-box">
            <h2>Problem Description</h2>
            <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>Click the card to review Description</h4>
            
            {/* Flip Card */}
            <div className="flip-card-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
              <div className={`flip-card ${isCardFlipped ? 'flipped' : ''}`}>
                {/* Card Front - Image */}
                <div className="flip-card-front">
                  <img src="/images/pvp_background.png" alt="PvP Battle" />
                </div>
                
                {/* Card Back - Description */}
                <div className="flip-card-back">
                  <div className="card-back-content">
                    <p>{problem?.problemDescription}</p>
                    {problem?.testCases && (
                      <>
                        <h5>Test Cases</h5>
                        <pre className="test-cases-code">{typeof problem.testCases === 'string' ? problem.testCases : JSON.stringify(problem.testCases, null, 2)}</pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden content for reference */}
            <div style={{ display: 'none' }}>
              <div className="pvp-problem-content">
                {problem?.testCases && (
                  <>
                    <h4>Test Cases</h4>
                    <pre className="test-cases-code">{typeof problem.testCases === 'string' ? problem.testCases : JSON.stringify(problem.testCases, null, 2)}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Divider */}
        <div
          className="resize-divider-horizontal"
          onMouseDown={() => setIsResizingHorizontal(true)}
          style={{ display: isFullscreenEditor ? 'none' : 'block' }}
        ></div>

        {/* RIGHT: Code Editor & Output */}
        <div className={`pvp-editor-panel ${isFullscreenEditor ? 'fullscreen' : ''}`} style={{ flex: `1 1 ${isFullscreenEditor ? '100%' : `${100 - leftPanelWidth}%`}` }}>
          {/* Editor Header */}
          <div className="pvp-editor-header">
            <div className="editor-header-left">
              <h2>Code Editor</h2>
              <select
                className="language-select"
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
            <div className="editor-header-right">
              <button
                className="icon-btn"
                onClick={() => setIsFullscreenEditor(!isFullscreenEditor)}
                aria-label={isFullscreenEditor ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreenEditor ? "⛶ Exit" : "⛶ Fullscreen"}
              </button>
              <button
                className="btn btn-run"
                onClick={handleRunCode}
                disabled={isRunning || submitted || timeRemaining === 0}
                title="Run test cases"
              >
                ▶ {isRunning ? "Running..." : "Run"}
              </button>
              <button
                className="btn btn-submit"
                onClick={handleSubmitCode}
                disabled={isRunning || submitted || timeRemaining === 0}
                title="Submit code"
              >
                ✓ {submitted ? "Submitted" : "Submit"}
              </button>
            </div>
          </div>

          {/* Code Editor Container */}
          <div className="code-editor-container" style={{ flex: `0 0 ${100 - outputPanelHeight}%` }}>
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              disabled={submitted}
              onSave={handleRunCode}
            />
          </div>

          {/* Vertical Resize Divider */}
          <div
            className="resize-divider-vertical"
            onMouseDown={() => setIsResizingVertical(true)}
          ></div>

          {/* Output Panel */}
          <div className="pvp-output-panel" style={{ flex: `0 0 ${outputPanelHeight}%` }}>
            <div className="output-header">
              <span className="output-label">Output</span>
              {isRunning && <span className="output-running">Running...</span>}
            </div>
            <pre className="output-content">{output}</pre>
          </div>

          {/* Bottom Buttons */}
          <div className="editor-footer">
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
