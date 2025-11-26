import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonService, userProgressService, lessonHintService } from "../../services/apiClient";
import { executeAndValidate, formatTestResults } from "../../services/pistonCompiler";
import { convertDbToEditorLanguage, convertDbToPistonLanguage, getLanguageDisplayName } from "../../utils/languageMapping";
import NPCChat from "../../components/NPCChat";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import Discussion from "../../components/Discussion";
import SuccessNotification from "../../components/SuccessNotification";
import AlertNotification from "../../components/AlertNotification";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/lessongame.css";

// NPC feedback for different practice problem types
const npcFeedback = {
  default: {
    hint: "Think carefully about the problem logic.",
    success: "Victory! You solved it correctly!",
    wrongOutput: "Not correct. Please try again!",
  }
};

export default function PracticeGame() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Output will display here...");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  
  // NPC Guide states
  const [npcMessage, setNpcMessage] = useState("");
  const [npcStatus, setNpcStatus] = useState("idle");
  const [showNpc, setShowNpc] = useState(false);

  // Success Notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successXpReward, setSuccessXpReward] = useState(0);

  // Alert Notification states
  const [showAlertNotification, setShowAlertNotification] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // User progress state
  const [userProgress, setUserProgress] = useState(null);
  // Hint
  const [hintsList, setHintsList] = useState([]);
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hintsError, setHintsError] = useState(null);

  // Loading screen state
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [pageLoadingMessage, setPageLoadingMessage] = useState("Loading problem...");

  // Sidebar panel state
  const [activeSidebarTab, setActiveSidebarTab] = useState(null);

  // Resizable state
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  // Fullscreen state
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);

  // Get test cases
  const getTestCases = () => {
    if (!problem || !problem.testCases) return [];
    return problem.testCases;
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, using mock data - replace with actual API when ready
        const mockProblem = {
          lessonId: problemId,
          lessonTitle: `Practice Problem #${problemId}`,
          language: "python",
          description: "Solve this coding problem",
          solutionTemplate: "# Write your solution here\n",
          testCases: [
            { input: "5", expectedOutput: "10" }
          ],
          xpReward: 10
        };
        
        setProblem(mockProblem);
        setCode(mockProblem.solutionTemplate);
        
      } catch (err) {
        setError(err.message || "An error occurred while loading the problem");
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // Run code handler
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setOutput("Compiling and running...");
      setNpcStatus("thinking");

      const pistonLanguage = convertDbToPistonLanguage(problem?.language || "python");

      const result = await executeAndValidate(
        code,
        pistonLanguage,
        problem?.testCases || []
      );

      if (result.success) {
        setOutput(result.data.output || "Program executed successfully");
        setExecutionTime(result.executionTime || 0);

        // Format test results
        const passed = result.data.testsPassed || 0;
        const total = problem?.testCases?.length || 1;
        
        setTestResults({
          success: passed === total,
          passed: passed,
          total: total,
          results: result.data.results || [],
        });

        // Check if all tests passed
        if (passed === total) {
          setNpcMessage("🎉 Excellent! All tests passed!");
          setNpcStatus("happy");
        } else {
          setNpcMessage(`${passed}/${total} tests passed. Keep trying!`);
          setNpcStatus("sad");
        }
      } else {
        setNpcMessage("There was an error compiling your code.");
        setNpcStatus("sad");
        setOutput(result.error || "Compilation error");
        setTestResults({
          success: false,
          passed: 0,
          total: problem?.testCases?.length || 1,
          results: [],
        });
      }
    } catch (err) {
      setNpcMessage("Error running code. Please try again.");
      setNpcStatus("sad");
      setOutput(err.message || "An error occurred");
      setTestResults({
        success: false,
        passed: 0,
        total: problem?.testCases?.length || 1,
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Get hint handler
  const handleGetHint = async () => {
    try {
      setHintsLoading(true);
      setHintsError(null);
      const result = await lessonHintService.getHintsByLessonId(problemId);
      
      if (result.success && result.data.length > 0) {
        setHintsList(result.data);
        setActiveSidebarTab('hints');
      } else {
        setHintsError("No hints available for this problem.");
        setActiveSidebarTab('hints');
      }
    } catch (err) {
      setHintsError(err.message || "Failed to fetch hints");
      setActiveSidebarTab('hints');
    } finally {
      setHintsLoading(false);
    }
  };

  // Handle horizontal resize (left/right panels)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingHorizontal) return;
      
      const main = document.querySelector('.leetcode-main');
      const problemPanel = document.querySelector('.problem-panel');
      if (!main || !problemPanel) return;

      const mainRect = main.getBoundingClientRect();
      const newWidth = e.clientX - mainRect.left;
      const percentage = (newWidth / mainRect.width) * 100;

      // Constrain between 25% and 70%
      if (percentage >= 25 && percentage <= 70) {
        problemPanel.style.flex = `0 0 ${percentage}%`;
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
    };

    if (isResizingHorizontal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHorizontal]);

  // Handle vertical resize (code editor/output)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingVertical) return;
      
      const editorPanel = document.querySelector('.editor-panel');
      const outputPanel = document.querySelector('.output-panel');
      if (!editorPanel || !outputPanel) return;

      const editorRect = editorPanel.getBoundingClientRect();
      const newHeight = editorRect.bottom - e.clientY;
      const percentage = (newHeight / editorRect.height) * 100;

      // Constrain between 15% and 60%
      if (percentage >= 15 && percentage <= 60) {
        outputPanel.style.flex = `0 0 ${percentage}%`;
      }
    };

    const handleMouseUp = () => {
      setIsResizingVertical(false);
    };

    if (isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingVertical]);

  if (loading) {
    return <LoadingScreen isVisible={true} message={pageLoadingMessage} />;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={handleBack}>Back to Practice</button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Problem not found</h1>
        <button onClick={handleBack}>Back to Practice</button>
      </div>
    );
  }

  return (
    <div className="lesson-screen-leetcode">
      <LoadingScreen isVisible={isPageLoading} message={pageLoadingMessage} />
      <SuccessNotification
        message={successMessage}
        xpReward={successXpReward}
        onClose={() => setShowSuccessNotification(false)}
        isVisible={showSuccessNotification}
      />
      <AlertNotification
        message={alertMessage}
        onClose={() => setShowAlertNotification(false)}
        isVisible={showAlertNotification}
      />

      {/* Header */}
      <header className="leetcode-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/practice")} title="Go back">
            ←
          </button>
          <h1 className="lesson-title">{problem?.lessonTitle || "Practice Problem"}</h1>
        </div>
        
        <div className="header-right">
          {testResults && (
            <div className={`header-status ${testResults.success ? 'completed' : 'pending'}`}>
              {testResults.success ? "Completed" : "In Progress"}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="leetcode-main">
        {/* Left: Problem Description + Sidebar Tabs */}
        <div className="problem-panel">
          {/* Tab Buttons */}
          <div className="sidebar-tabs">
            <button
              className={`tab-btn ${activeSidebarTab === null ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab(null)}
              title="Problem Description"
            >
              📝
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('discussion')}
              title="Discussion"
            >
              💬
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'hints' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('hints')}
              title="Hints & Tips"
            >
              💡
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'npc' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('npc')}
              title="NPC Chat"
            >
              🧙
            </button>
          </div>

          {/* Tab Content */}
          <div className="sidebar-content">
            {/* Description Tab (Default) */}
            {activeSidebarTab === null && (
              <div className="tab-pane active">
                <div className="problem-description-box">
                  <h2>Problem Description</h2>
                  <div className="description-content">
                    <ProblemDescription description={problem?.description || "No description available"} />
                  </div>

                  {/* Test Cases Preview */}
                  {getTestCases().length > 0 && (
                    <div className="test-cases-section">
                      {(() => {
                        const publicTests = getTestCases().filter(tc => !tc.hidden);
                        return (
                          <>
                            <h3>Test Cases ({publicTests.length})</h3>
                            <div className="test-cases-list">
                              {publicTests.slice(0, 5).map((tc, idx) => (
                                <div key={idx} className="test-case-item">
                                  <div className="test-label">Example {idx + 1}:</div>
                                  <div className="test-io">
                                    <div><strong>Input:</strong> <code>{tc.input || "N/A"}</code></div>
                                    <div><strong>Output:</strong> <code>{tc.expected || tc.expectedOutput || "N/A"}</code></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discussion Tab */}
            {activeSidebarTab === 'discussion' && (
              <div className="tab-pane active">
                <Discussion lessonId={problemId} />
              </div>
            )}

            {/* Hints Tab */}
            {activeSidebarTab === 'hints' && (
              <div className="tab-pane active">
                <div className="hints-box">
                  <h2>Hints & Tips</h2>
                  {hintsLoading ? (
                    <p style={{color: 'var(--text-secondary)'}}>Loading hints...</p>
                  ) : hintsError ? (
                    <p style={{color: 'var(--error-color)'}}>{hintsError}</p>
                  ) : hintsList.length > 0 ? (
                    <div className="hints-content">
                      {hintsList.map((hint, idx) => (
                        <div key={idx} className="hint-item">
                          <h3>Hint {idx + 1}</h3>
                          <p>{hint.hintText || hint.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{color: 'var(--text-secondary)'}}>No hints available</p>
                  )}
                </div>
              </div>
            )}

            {/* NPC Chat Tab */}
            {activeSidebarTab === 'npc' && (
              <div className="tab-pane active">
                <div className="npc-box">
                  <h2>NPC Guide</h2>
                  <div className="npc-content">
                    {npcMessage ? (
                      <p>{npcMessage}</p>
                    ) : (
                      <p style={{color: 'var(--text-secondary)'}}>Click "Get Help" to receive guidance from your NPC mentor</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div 
          className="resize-divider-horizontal"
          onMouseDown={() => setIsResizingHorizontal(true)}
          style={{ display: isFullscreenEditor ? 'none' : 'block' }}
        ></div>

        {/* Right: Code Editor + Output */}
        <div className={`editor-panel ${isFullscreenEditor ? 'fullscreen' : ''}`}>
          {/* Editor Header */}
          <div className="editor-header">
            <div className="editor-header-left">
              <h2>Solution</h2>
              <span className="lang-badge">{convertDbToEditorLanguage(problem?.language || "python")}</span>
            </div>
            <div className="editor-header-right">
              <button
                className="icon-btn"
                onClick={() => setIsFullscreenEditor(!isFullscreenEditor)}
                aria-label={isFullscreenEditor ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreenEditor ? "⛶" : "⛶"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="practice-action-buttons">
            <button
              className="btn btn-run"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "▶ Run"}
            </button>
            <button
              className="btn"
              onClick={handleGetHint}
              disabled={hintsLoading}
              style={{
                backgroundColor: 'var(--warning-color)',
                color: '#1a1a1a'
              }}
            >
              💡 Get Help
            </button>
            <button
              className="btn btn-submit"
              onClick={async () => {
                if (testResults?.success) {
                  setSuccessMessage("Problem solved! Great job!");
                  setSuccessXpReward(problem?.xpReward || 10);
                  setShowSuccessNotification(true);
                } else {
                  setAlertMessage("Please pass all tests first!");
                  setShowAlertNotification(true);
                }
              }}
              disabled={isRunning || !testResults?.success}
              title="Submit when all tests pass"
            >
              ✓ Submit
            </button>
          </div>

          {/* Code Editor */}
          <div className="code-editor-container">
            <CodeEditor 
              code={code}
              onChange={setCode}
              language={convertDbToEditorLanguage(problem?.language || "python")}
              disabled={isRunning}
              onSave={handleRunCode}
            />
          </div>

          {/* Vertical Resize Divider */}
          <div 
            className="resize-divider-vertical"
            onMouseDown={() => setIsResizingVertical(true)}
          ></div>

          {/* Output Console */}
          <div className="output-panel">
            <div className="output-header">
              <span className="output-label">Output</span>
              <span className={`output-status ${isRunning ? 'running' : ''}`}>
                {isRunning ? "Running..." : "Ready"}
              </span>
              {executionTime > 0 && <span className="exec-time">{executionTime}ms</span>}
            </div>
            <pre className="output-content">{output}</pre>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className={`test-results ${testResults.success ? 'success' : 'failure'}`}>
              <div className="results-header">
                {testResults.success ? (
                  <>
                    <span className="result-icon success-icon">✓</span>
                    <span className="result-text">ALL TESTS PASSED</span>
                  </>
                ) : (
                  <>
                    <span className="result-icon fail-icon">✗</span>
                    <span className="result-text">{testResults.passed}/{testResults.total} Tests Passed</span>
                  </>
                )}
              </div>
              {testResults.results && testResults.results.length > 0 && (
                <div className="results-body">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.passed ? 'pass' : 'fail'}`}>
                      <span className={`result-badge ${result.passed ? 'pass' : 'fail'}`}>
                        {result.passed ? '✓' : '✗'}
                      </span>
                      <span className="result-name">Test {idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
