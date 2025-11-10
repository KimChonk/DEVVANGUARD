import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonService, userProgressService } from "../../services/apiClient";
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

// NPC feedback for different lesson types
const npcFeedback = {
  helloWorld: {
    hint: "Use the print() function to output a text string.",
    success: "You won! Successfully printed!",
    wrongOutput: "Output doesn't match. Please check again.",
  },
  doubleNumber: {
    hint: "Read a number from input and multiply it by 2.",
    success: "Victory! Perfect multiplication!",
    wrongOutput: "Wrong result. Try again.",
  },
  sumNumbers: {
    hint: "Add all the numbers together.",
    success: "Victory! You're great at addition!",
    wrongOutput: "Incorrect. Try again!",
  },
  default: {
    hint: "Think carefully about the problem logic.",
    success: "Victory! You're very skilled!",
    wrongOutput: "Not correct. Please try again!",
  }
};

export default function LessonScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Kết quả sẽ hiển thị ở đây...");
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

  // Alert Notification states (for already completed lessons)
  const [showAlertNotification, setShowAlertNotification] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // User progress state
  const [userProgress, setUserProgress] = useState(null);

  // Loading screen state
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [pageLoadingMessage, setPageLoadingMessage] = useState("Loading lesson...");

  // Sidebar panel state
  const [activeSidebarTab, setActiveSidebarTab] = useState(null); // null, 'description', 'discussion', 'hints', 'npc'

  // Resizable state
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  // Fullscreen state
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching lesson ${lessonId}...`);
        const result = await lessonService.getLessonById(lessonId);
        
        if (result.success) {
          console.log("✓ Lesson fetched:", result.data);
          setLesson(result.data);
          
          // Initialize code with template
          if (result.data.solutionTemplate) {
            setCode(result.data.solutionTemplate);
          }
          
          // Fetch user progress for this lesson
          const progressResult = await userProgressService.getUserProgressByLessonId(lessonId);
          if (progressResult.success && progressResult.data) {
            setUserProgress(progressResult.data);
            console.log("✓ User progress:", progressResult.data);
          }
          
          // Show welcome message
          setNpcStatus("welcome");
          setShowNpc(true);
        } else {
          console.error("✗ Fetch failed:", result.message);
          setError(result.message);
        }
      } catch (err) {
        console.error("✗ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Get feedback based on lesson
  const getFeedback = () => {
    if (!lesson) return npcFeedback.default;
    
    const title = lesson.lessonTitle?.toLowerCase() || "";
    if (title.includes("hello")) return npcFeedback.helloWorld;
    if (title.includes("double") || title.includes("nhân")) return npcFeedback.doubleNumber;
    if (title.includes("sum") || title.includes("cộng")) return npcFeedback.sumNumbers;
    
    return npcFeedback.default;
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

  // Parse test cases
  const getTestCases = () => {
    if (!lesson?.testCases) return [];
    try {
      return typeof lesson.testCases === 'string' 
        ? JSON.parse(lesson.testCases) 
        : lesson.testCases;
    } catch (err) {
      console.warn("Could not parse test cases:", err);
      return [];
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    setTestResults(null);
    setExecutionTime(0);
    setNpcStatus("thinking");
    setShowNpc(true);
    
    try {
      // Get course language from lesson
      const dbLanguage = lesson?.course?.language;
      if (!dbLanguage) {
        setOutput("Error: Could not find the course language!");
        setNpcStatus("error");
        return;
      }

      // Convert DB language to Piston API language
      const language = convertDbToPistonLanguage(dbLanguage);
      const testCases = getTestCases();

      console.log(`Executing ${language} code with ${testCases.length} test cases...`);
      console.log(`Course Language: ${dbLanguage} → Piston Language: ${language}`);

      // Execute code and validate
      const result = await executeAndValidate(language, code, testCases);

      // Store execution time
      setExecutionTime(result.execution.executionTime || 0);

      // Show output
      if (result.execution.success) {
        let displayOutput = result.execution.stdout;
        
        if (testCases.length > 0) {
          displayOutput += result.formattedResults;
        }
        
        setOutput(displayOutput);
        
        // Set NPC feedback
        const feedback = getFeedback();
        if (result.passed) {
          setNpcMessage(feedback.success);
          setNpcStatus("success");
        } else {
          setNpcMessage(feedback.wrongOutput);
          setNpcStatus("error");
        }
        setShowNpc(true);
        
        setTestResults({
          passed: result.validation.passed,
          total: result.validation.total,
          results: result.validation.results,
          message: result.message,
          success: result.passed,
        });
      } else {
        setOutput(`Error:\n${result.execution.stderr}`);
        const feedback = getFeedback();
        setNpcMessage(feedback.wrongOutput);
        setNpcStatus("error");
        setShowNpc(true);
        
        setTestResults({
          passed: 0,
          total: testCases.length,
          results: [],
          message: "Execution failed",
          success: false,
        });
      }
    } catch (err) {
      console.error("✗ Error:", err);
      setOutput(`Error: ${err.message}`);
      setNpcMessage(`Error occurred: ${err.message}`);
      setNpcStatus("error");
      setShowNpc(true);
      
      setTestResults({
        passed: 0,
        total: 0,
        results: [],
        message: err.message,
        success: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleHint = () => {
    const feedback = getFeedback();
    setNpcMessage(feedback.hint);
    setNpcStatus("hint");
    setShowNpc(true);
  };



  const testCases = getTestCases();

  return (
    <div className="lesson-screen-leetcode">
      <LoadingScreen isVisible={isPageLoading} message={pageLoadingMessage} />
      {/* Header */}
      <header className="leetcode-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
            ←
          </button>
          <h1 className="lesson-title">{lesson?.lessonTitle || "Lesson"}</h1>
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
              <img src="/icons/code-icon.png" alt="Description" className="tab-icon" />
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('discussion')}
              title="Discussion"
            >
              <img src="/icons/discusion-icon.png" alt="Discussion" className="tab-icon" />
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'hints' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('hints')}
              title="Hints & Tips"
            >
              <img src="/icons/hint-icon.png" alt="Hints" className="tab-icon" />
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'npc' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('npc')}
              title="NPC Chat"
            >
              <img src="/icons/masterOogWay.png" alt="NPC" className="tab-icon" />
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
                    <ProblemDescription description={lesson?.problemDescription} />
                  </div>

                  {/* Test Cases Preview */}
                  {testCases.length > 0 && (
                    <div className="test-cases-section">
                      {(() => {
                        const publicTests = testCases.filter(tc => !tc.hidden);
                        return (
                          <>
                            <h3>Test Cases ({publicTests.length})</h3>
                            <div className="test-cases-list">
                              {publicTests.slice(0, 5).map((tc, idx) => (
                                <div key={idx} className="test-case-item">
                                  <div className="test-label">Example {idx + 1}:</div>
                                  <div className="test-io">
                                    <div><strong>Input:</strong> <code>{tc.input || "N/A"}</code></div>
                                    <div><strong>Output:</strong> <code>{tc.expected || tc.expected_output || "N/A"}</code></div>
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
                <Discussion lessonId={lessonId} />
              </div>
            )}

            {/* Hints Tab */}
            {activeSidebarTab === 'hints' && (
              <div className="tab-pane active">
                <div className="hints-box">
                  <h2>Hints & Tips</h2>
                  <div className="hints-content">
                    <div className="hint-item">
                      <h3>Step 1: Read the Problem Carefully</h3>
                      <p>Make sure you understand all the requirements before you start coding.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Step 2: Plan Your Approach</h3>
                      <p>Write down the steps to solve the problem before you start coding.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Step 3: Write Code Step by Step</h3>
                      <p>Write code in small parts and test each part to find bugs more easily.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Hint for this problem:</h3>
                      <p>{getFeedback().hint}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NPC Chat Tab */}
            {activeSidebarTab === 'npc' && (
              <div className="tab-pane active">
                <div className="npc-box">
                  <h2>NPC Guide</h2>
                  <div className="npc-content">
                    <NPCChat 
                      feedback={npcMessage || "Hello, knight! Start your adventure!"}
                      status={npcStatus}
                      problemDescription={lesson?.problemDescription || ''}
                      userCode={code}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Resize Divider */}
        <div 
          className="resize-divider-horizontal"
          onMouseDown={() => setIsResizingHorizontal(true)}
          style={{ display: isFullscreenEditor ? 'none' : 'block' }}
        ></div>

        {/* Right: Code Editor */}
        <div className={`editor-panel ${isFullscreenEditor ? 'fullscreen' : ''}`}>
          {/* Editor Header with Language and Buttons */}
          <div className="editor-header">
            <div className="editor-header-left">
              <h2>Code Editor</h2>
              <span className="lang-badge">{getLanguageDisplayName(lesson?.course?.language)}</span>
            </div>
            <div className="editor-header-right">
              <button
                className="icon-btn"
                onClick={() => navigate(-1)}
                aria-label="Back"
              >
                ← Back
              </button>

              <button
                className="icon-btn"
                onClick={() => navigate(1)}
                aria-label="Forward"
              >
                Forward →
              </button>

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
                disabled={isRunning}
                title="Run test cases"
              >
                ▶ {isRunning ? "Running..." : "Run"}
              </button>
              
              <button
                className="btn btn-submit"
                onClick={async () => {
                  if (!testResults?.success) {
                    alert("Please make sure all test cases pass!");
                    return;
                  }

                  // Check if lesson already completed BEFORE submitting
                  if (userProgress && userProgress.status === "completed") {
                    setAlertMessage("This lesson is already completed!\nYou cannot submit again and will not receive additional XP.");
                    setShowAlertNotification(true);
                    return;
                  }

                  // Submit lesson to backend
                  const result = await userProgressService.submitLesson(lessonId);
                  
                  if (result.success) {
                    const { xpReward, totalXp } = result.data;
                    setSuccessXpReward(xpReward);
                    setSuccessMessage(`You completed this lesson!\nTotal XP: ${totalXp}`);
                    setShowSuccessNotification(true);
                    
                    // Navigate after success animation completes
                    setTimeout(() => {
                      navigate(-1);
                    }, 3600);
                  } else {
                    // Check if lesson was already completed
                    if (result.data?.alreadyCompleted) {
                      setAlertMessage("This lesson is already completed!\nYou cannot submit again and will not receive additional XP.");
                      setShowAlertNotification(true);
                    } else {
                      alert(`Error submitting lesson: ${result.message}`);
                    }
                  }
                }}
                disabled={isRunning || !testResults?.success}
                title="Submit when all tests pass"
              >
                ✓ Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="code-editor-container">
            <CodeEditor 
              code={code}
              onChange={setCode}
              language={convertDbToEditorLanguage(lesson?.course?.language)}
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
                    <span className="result-icon">Success!</span>
                    <span>ALL TESTS PASSED!</span>
                  </>
                ) : (
                  <>
                    <span className="result-icon">Failed</span>
                    <span>{testResults.passed}/{testResults.total} Tests Passed</span>
                  </>
                )}
              </div>
              {testResults.results && testResults.results.length > 0 && (
                <div className="results-body">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.passed ? 'pass' : 'fail'}`}>
                      <span className="result-status">{result.passed ? "Pass" : "Fail"}</span>
                      <span className="result-name">Test {idx + 1}</span>
                      {!result.passed && (
                        <div className="result-details">
                          <div>Expected: <code>{result.expected}</code></div>
                          <div>Got: <code>{result.actual}</code></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message={successMessage}
        xpReward={successXpReward}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Alert Notification - Already Completed */}
      <AlertNotification
        isVisible={showAlertNotification}
        message={alertMessage}
        onClose={() => setShowAlertNotification(false)}
        onClosedComplete={() => navigate(-1)}
      />

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading lesson...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-overlay">
          <div className="error-dialog">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>Go back</button>
          </div>
        </div>
      )}
    </div>
  );
}