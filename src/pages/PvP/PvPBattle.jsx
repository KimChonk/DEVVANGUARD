import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePvP } from '../../hooks/usePvP';
import { useUser } from '../../hooks/useUser';
import { userService } from '../../services/apiClient';
import { executePvPAndValidate, getCodeTemplate } from '../../services/pistonCompilerPvP';
import ProblemDescription from '../../components/ProblemDescription';
import BattleResultNotification from '../../components/BattleResultNotification';
import CodeEditor from '../../components/CodeEditor';
import '../../assets/CSS/pvpbattle.css';

const BATTLE_DURATION = 600;
const PREPARATION_TIME = 5;
const LANGUAGE_OPTIONS = ['python', 'java', 'c', 'cpp'];

export default function PvPBattle() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { userStats } = useUser();
  const { getMatchById, getProblemById, submitCode, playerDisconnect } = usePvP();

  // Match & Problem State
  const [match, setMatch] = useState(null);
  const [problem, setProblem] = useState(null);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [battleEndTime, setBattleEndTime] = useState(null);
  
  // Code State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  
  // UI State
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorNotif, setShowErrorNotif] = useState(false);
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(BATTLE_DURATION);
  const [prepTime, setPrepTime] = useState(PREPARATION_TIME);
  const [battleStarted, setBattleStarted] = useState(false);
  
  // Battle result state
  const [battleResult, setBattleResult] = useState(null);
  const [showBattleResult, setShowBattleResult] = useState(false);
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [outputPanelHeight, setOutputPanelHeight] = useState(40);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Handle page unload/disconnect
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (match && match.status === 'in_progress' && !submitted) {
        e.preventDefault();
        e.returnValue = '';
        
        console.log('[PvPBattle] Player disconnecting, calling playerDisconnect API...');
        try {
          await playerDisconnect(match.matchId);
        } catch (err) {
          console.error('[PvPBattle] Error calling playerDisconnect:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [match, submitted, playerDisconnect]);

  // Handle language change - update code template
  useEffect(() => {
    if (!submitted && problem) {
      const template = getCodeTemplate(language);
      setCode(template);
      setAllTestsPassed(false); // Reset test status when language changes
      setOutput(''); // Clear output when language changes
      console.log(`[PvPBattle] Language: ${language}`);
    }
  }, [language, submitted, problem]);

  // Load battle data on mount
  useEffect(() => {
    const loadBattle = async () => {
      try {
        console.log('[PvPBattle] Component mounted, matchId:', matchId);
        setIsLoading(true);
        
        // If no matchId, skip loading from API (demo/design mode)
        if (!matchId) {
          console.log('[PvPBattle] No matchId, using demo problem');
          setProblem({
            problemId: 'demo-1',
            title: 'Demo Problem',
            description: 'This is a demo battle interface',
            difficulty: 'medium',
            solutionTemplate: '# Write your code here\nprint("Hello World")'
          });
          setCode('# Write your code here\nprint("Hello World")');
          setIsLoading(false);
          return;
        }

        console.log('[PvPBattle] Loading match:', matchId);
        const matchResult = await getMatchById(matchId);
        console.log('[PvPBattle] Match result:', matchResult);
        
        // Handle both wrapped {success, data} and direct object formats
        let matchData = null;
        if (matchResult && matchResult.success && matchResult.data) {
          matchData = matchResult.data;
        } else if (matchResult && matchResult.matchId) {
          matchData = matchResult;
        }
        
        if (matchData) {
          console.log('[PvPBattle] Match data loaded:', matchData);
          setMatch(matchData);
          
          // Set battle end time (server time based)
          if (matchData.createdAt) {
            const createdTime = new Date(matchData.createdAt).getTime();
            const endTime = createdTime + (BATTLE_DURATION * 1000);
            setBattleEndTime(new Date(endTime));
          }
          
          // Fetch opponent name
          const currentUserId = userStats?.user?.userId;
          let opponentId;
          if (currentUserId === matchData.player1Id) {
            opponentId = matchData.player2Id;
          } else if (currentUserId === matchData.player2Id) {
            opponentId = matchData.player1Id;
          }
          
          if (opponentId && opponentId !== currentUserId) {
            try {
              const result = await userService.getUserProfile(opponentId);
              if (result.success && result.data) {
                setOpponentName(result.data.fullName || result.data.full_name || result.data.email || 'Opponent');
                console.log('[PvPBattle] Opponent name fetched:', result.data.fullName);
              } else {
                setOpponentName('Opponent');
              }
            } catch (err) {
              console.error('[PvPBattle] Failed to fetch opponent:', err);
              setOpponentName('Opponent');
            }
          } else {
            setOpponentName('Opponent');
          }

          if (matchData.problemId) {
            console.log('[PvPBattle] Loading problem:', matchData.problemId);
            const problemData = await getProblemById(matchData.problemId);
            console.log('[PvPBattle] Problem data loaded:', problemData);
            if (problemData) {
              setProblem(problemData);
              if (problemData.solutionTemplate) {
                setCode(problemData.solutionTemplate);
              }
              setIsLoading(false);
            } else {
            console.error('[PvPBattle] Problem data is null');
            setErrorMessage('Load problem failed');
            setShowErrorNotif(true);
              setIsLoading(false);
            }
          } else {
            console.error('[PvPBattle] Problem ID missing:', matchData);
            setErrorMessage('Problem missing');
            setShowErrorNotif(true);
            setIsLoading(false);
          }
        } else {
          console.error('[PvPBattle] Invalid match result:', matchResult);
          setErrorMessage('Match load failed');
          setShowErrorNotif(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load battle:', err);
        setErrorMessage('Battle load failed');
        setShowErrorNotif(true);
        setIsLoading(false);
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
    if (!battleStarted || !battleEndTime) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTimeMs = new Date(battleEndTime).getTime();
      const remaining = Math.max(0, Math.ceil((endTimeMs - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && !submitted) {
        // Battle timeout - treat as draw if no one submitted
        setErrorMessage('Time ended. Draw.');
        setShowErrorNotif(true);
        clearInterval(timer);
        setTimeout(() => {
          navigate('/pvp/lobby');
        }, 2000);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [battleStarted, battleEndTime, submitted, navigate]);

  useEffect(() => {
    if (!matchId) return;
    // Start polling either when battle starts OR when code is submitted
    if (!battleStarted && !submitted) return;

    console.log('[PvPBattle] Starting polling for winner detection...');
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const result = await getMatchById(matchId);
        
        // Handle both response formats
        let updatedMatch = null;
        if (result && result.success && result.data) {
          updatedMatch = result.data;
        } else if (result && result.matchId) {
          updatedMatch = result;
        }
        
        if (!updatedMatch) {
          console.log('[PvPBattle] No match data returned');
          return;
        }

        console.log('[PvPBattle] Poll result - status:', updatedMatch.status, 'winnerId:', updatedMatch.winnerId);

        // Check if match is completed
        if (updatedMatch.status === 'completed' && updatedMatch.winnerId) {
          clearInterval(pollingIntervalRef.current);
          console.log('[PvPBattle] Match completed! Winner:', updatedMatch.winnerId);
          
          const currentUserId = userStats?.user?.userId;
          const isPlayer1 = match?.player1Id === currentUserId;
          const isWinner = updatedMatch.winnerId === currentUserId;
          const xpChange = isPlayer1 ? updatedMatch.xpChangeP1 : updatedMatch.xpChangeP2;
          
          console.log('[PvPBattle] Current user:', currentUserId, 'Is winner:', isWinner, 'XP change:', xpChange);
          console.log('[PvPBattle] XP already updated by backend API');
          
          setBattleResult({
            isVictory: isWinner,
            xpChange: xpChange || (isWinner ? 20 : -5),
            message: isWinner ? 'You defeated your opponent!' : 'Opponent defeated you'
          });
          setShowBattleResult(true);

          // 5 second delay before redirect
          setTimeout(() => {
            console.log('[PvPBattle] Redirecting to lobby...');
            navigate('/pvp/lobby');
          }, 5000);
        }
      } catch (err) {
        console.error('[PvPBattle] Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds for faster result detection

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [battleStarted, submitted, matchId, getMatchById, userStats, navigate, match]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running tests...');
    setAllTestsPassed(false);

    try {
      if (!problem || !problem.testCases) {
        setOutput('No test cases available');
        setIsRunning(false);
        return;
      }

      let testCases = problem.testCases;
      if (typeof testCases === 'string') {
        testCases = JSON.parse(testCases);
      }

      console.log('[PvPBattle] Running code with language:', language);
      console.log('[PvPBattle] Test cases:', testCases);

      const result = await executePvPAndValidate(language, code, testCases);

      console.log('[PvPBattle] Test result:', result);

      // Track if all tests passed
      setTestResults(result);
      if (result.allPassed) {
        setAllTestsPassed(true);
        setOutput(result.detailedResults || result.output + '\n\nAll tests passed! Submit code.');
      } else {
        setAllTestsPassed(false);
        setOutput(result.detailedResults || result.output);
      }
    } catch (err) {
      console.error('[PvPBattle] Run error:', err);
      setOutput(`Error: ${err.message}`);
      setAllTestsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (submitted) {
      setErrorMessage('Already submitted');
      setShowErrorNotif(true);
      return;
    }

    if (!matchId) {
      setErrorMessage('Match not found');
      setShowErrorNotif(true);
      return;
    }

    try {
      setIsRunning(true);
      
      // First validate code with test cases
      if (problem && problem.testCases) {
        let testCases = problem.testCases;
        if (typeof testCases === 'string') {
          testCases = JSON.parse(testCases);
        }

        console.log('[PvPBattle] Validating before submit:', language);
        const result = await executePvPAndValidate(language, code, testCases);
        
        if (!result.allPassed) {
          setErrorMessage(`${result.passedCount}/${result.totalCount} tests passed`);
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
        setErrorMessage('Code submitted. Waiting for opponent...');
        setShowErrorNotif(true);
        // Don't redirect yet - let polling detect winner
      } else {
        setErrorMessage(submitResult.message || 'Submit failed');
        setShowErrorNotif(true);
      }
    } catch (err) {
      console.error('Submit code error:', err);
      setErrorMessage(err.message || 'Submit failed');
      setShowErrorNotif(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuitBattle = async () => {
    const confirmed = window.confirm('Quit? This counts as loss.');
    if (confirmed) {
      if (match && match.status === 'in_progress') {
        try {
          console.log('[PvPBattle] Player quitting, calling playerDisconnect...');
          await playerDisconnect(match.matchId);
        } catch (err) {
          console.error('[PvPBattle] Error calling playerDisconnect:', err);
        }
      }
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
          <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            {isLoading ? 'Loading battle...' : 'Load failed'}
          </div>
          {showErrorNotif && (
            <div style={{ color: '#ff6b6b', marginTop: '20px' }}>
              Error: {errorMessage}
            </div>
          )}
          {isLoading && (
            <div style={{ fontSize: '2rem', marginTop: '20px', animation: 'pulse 1s infinite' }}>
              ⚙️
            </div>
          )}
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
                    {opponentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="pvp-player-info">
                    <h3>{opponentName}</h3>
                    <p>{match?.player2Id ? 'In Battle' : 'Waiting'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="pvp-problem-box">
            <h2>📋 Problem Description</h2>
            
            {/* Use ProblemDescription component for formatted display */}
            <ProblemDescription description={problem?.problemDescription} />
            
            {/* Test Cases */}
            {problem?.testCases && (
              <div className="pvp-test-cases-section" style={{ marginTop: '20px' }}>
                <h3>🧪 Test Cases</h3>
                <div className="test-cases-container">
                  {Array.isArray(problem.testCases) ? (
                    problem.testCases.map((testCase, idx) => (
                      <div key={idx} className="test-case-item">
                        <div className="test-case-header">Test Case {idx + 1}: {testCase.name || ''}</div>
                        <div className="test-case-body">
                          <div><strong>Input:</strong></div>
                          <pre className="test-case-input">{testCase.input || testCase.input_value || '(empty)'}</pre>
                          <div><strong>Expected Output:</strong></div>
                          <pre className="test-case-expected">{testCase.expected_output || testCase.expected || '(empty)'}</pre>
                        </div>
                      </div>
                    ))
                  ) : (
                    <pre className="test-cases-code">{typeof problem.testCases === 'string' ? problem.testCases : JSON.stringify(problem.testCases, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
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
                disabled={isRunning || submitted || timeRemaining === 0 || !allTestsPassed}
                title={!allTestsPassed ? "Run tests and pass all before submitting" : "Submit code"}
              >
                Submit {submitted ? "(Submitted)" : ""}
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

      {showBattleResult && battleResult && (
        <BattleResultNotification
          isVisible={showBattleResult}
          message={battleResult.message}
          isVictory={battleResult.isVictory}
          xpChange={battleResult.xpChange}
          duration={5000}
          onClose={() => setShowBattleResult(false)}
        />
      )}

      {showErrorNotif && errorMessage && !showBattleResult && (
        <div className="simple-error-notif">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
