import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonService, userProgressService, lessonHintService } from "../../services/apiClient";
import { executeAndValidate, formatTestResults } from "../../services/pistonCompiler";
import { convertDbToEditorLanguage, convertDbToPistonLanguage, getLanguageDisplayName } from "../../utils/languageMapping";
import { formatProblemDescription } from "../../utils/problemDescriptionParser";
import NPCChat from "../../components/NPCChat";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import Discussion from "../../components/Discussion";
import SuccessNotification from "../../components/SuccessNotification";
import AlertNotification from "../../components/AlertNotification";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/lessongame.css";

// SVG Icons
const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
  </svg>
);
const CompressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
     <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5z"/>
  </svg>
);
const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
  </svg>
);

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
  const [output, setOutput] = useState("Result will show here...");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  
  // Hints state
  const [hints, setHints] = useState([]);
  const [hintsLoading, setHintsLoading] = useState(false);
  
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

  // Editor and Console layout states
  const [isEditorFolded, setIsEditorFolded] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [isConsoleFolded, setIsConsoleFolded] = useState(false);
  const [isConsoleMaximized, setIsConsoleMaximized] = useState(false);

  // Layout Refs
  const mainContainerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightColumnRef = useRef(null); // Ref cho cột phải
  const codeContainerRef = useRef(null); // Ref cho panel code (trên)
  const testContainerRef = useRef(null); // Ref cho panel console (dưới)

  // Resizer refs and states
  const verticalResizerRef = useRef(null);
  const horizontalResizerRef = useRef(null);
  const isVerticalResizing = useRef(false);
  const isHorizontalResizing = useRef(false);

  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState("1fr"); // '1fr' là giá trị mặc định

  // Right column (code editor + console) resizing state
  const [topRightPanelHeight, setTopRightPanelHeight] = useState('60%');



  
  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(` Fetching lesson ${lessonId}...`);
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
            console.log(" User progress:", progressResult.data);
          }

          // Fetch hints for this lesson
          setHintsLoading(true);
          const hintsResult = await lessonHintService.getHintsByLessonId(lessonId);
          if (hintsResult.success) {
            setHints(hintsResult.data || []);
            console.log(" Hints fetched:", hintsResult.data);
          } else {
            console.warn(" Could not fetch hints:", hintsResult.message);
            setHints([]);
          }
          setHintsLoading(false);
          
          // Show welcome message
          setNpcStatus("welcome");
          setShowNpc(true);
        } else {
          console.error(" Fetch failed:", result.message);
          setError(result.message);
        }
      } catch (err) {
        console.error(" Error:", err);
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


  const toggleEditorFold = () => {
    if (!isEditorFolded) {
      if (isEditorMaximized) setIsEditorMaximized(false);
      if (isConsoleFolded) setIsConsoleFolded(false); // Mở panel kia
    }
    setIsEditorFolded(!isEditorFolded);
  };
  const toggleEditorMaximize = () => {
    if (!isEditorMaximized) {
      setIsEditorFolded(false);
      setIsConsoleMaximized(false);
    }
    setIsEditorMaximized(!isEditorMaximized);
  };
  const toggleConsoleFold = () => {
    if (!isConsoleFolded) {
      if (isConsoleMaximized) setIsConsoleMaximized(false);
      if (isEditorFolded) setIsEditorFolded(false); // Mở panel kia
    }
    setIsConsoleFolded(!isConsoleFolded);
  };
  const toggleConsoleMaximize = () => {
    if (!isConsoleMaximized) {
      setIsConsoleFolded(false);
      setIsEditorMaximized(false);
    }
    setIsConsoleMaximized(!isConsoleMaximized);
  };

  const handleVerticalMouseDown = useCallback((e) => {
    e.preventDefault();
    isVerticalResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = leftPanelRef.current.getBoundingClientRect().width;
    const containerWidth = mainContainerRef.current.getBoundingClientRect().width;

    const doDrag = (moveEvent) => {
      if (!isVerticalResizing.current) return;
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= 300 && newWidth <= containerWidth - 300) {
        leftPanelRef.current.style.flexBasis = `${newWidth}px`;
      }
    };
    const stopDrag = () => {
      isVerticalResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  }, []);

  const handleHorizontalMouseDown = useCallback((e) => {
    e.preventDefault();
        if (!testContainerRef.current || !rightColumnRef.current) return;

        // Tự động mở Test Case nếu đang kéo khi nó đóng
        if (isConsoleFolded) {
            setIsConsoleFolded(false);
        }

        const startY = e.clientY;
        const startHeight = testContainerRef.current.getBoundingClientRect().height;
        const containerHeight = rightColumnRef.current.getBoundingClientRect().height;
        
        // --- LOGIC MỚI ---
        const minHeightFolded = 45;   // Chiều cao tối thiểu (chiều cao của header khi đã gập)
        const minHeightBeforeFold = 80; // Ngưỡng để kích hoạt gập tự động

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';

        const doDrag = (moveEvent) => {
            const deltaY = startY - moveEvent.clientY; // Dương khi kéo LÊN
            const newHeight = startHeight + deltaY;

            // 1. Nếu đang kéo XUỐNG và chiều cao thấp hơn ngưỡng -> TỰ ĐỘNG GẬP
            if (!isConsoleFolded && newHeight < minHeightBeforeFold) {
                setIsConsoleFolded(true); // Kích hoạt trạng thái gập
                stopDrag(); // Dừng kéo ngay lập tức
            } 
            // 2. Nếu kéo lên hoặc kéo xuống bình thường (vẫn trên ngưỡng)
            else if (newHeight >= minHeightFolded && newHeight <= containerHeight * 0.8) {
                testContainerRef.current.style.flexBasis = `${newHeight}px`;
            }
        };

        const stopDrag = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    }, [isConsoleFolded]);


  const testCases = getTestCases();
  const publicTests = testCases.filter(tc => !tc.hidden);

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
      <div className={`leetcode-main ${isEditorMaximized || isConsoleMaximized ? 'maximized-mode' : ''}`}
        ref={mainContainerRef}
        // style={{ gridTemplateColumns: `${leftPanelWidth} 10px 1fr` }}
        >
        {/* Left: Problem Description + Sidebar Tabs */}
        <div className="problem-panel" ref={leftPanelRef} style={{ flex: '0 0 50%' }}>
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
                    {hintsLoading ? (
                      <div className="loading-message">Loading hints...</div>
                    ) : hints && hints.length > 0 ? (
                      hints.map((hint, index) => (
                        <div key={hint.hintId || index} className="hint-item">
                          <h3>{hint.title}</h3>
                          <div 
                            className="hint-content-formatted"
                            dangerouslySetInnerHTML={{ __html: formatProblemDescription(hint.content) }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="no-hints-message">
                        <p>No hints available for this lesson yet.</p>
                      </div>
                    )}
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
        
        <div 
          className="vertical-resizer-handle"
          onMouseDown={handleVerticalMouseDown}
        >
        </div>

        <div 
          className="right-column-container" 
          ref={rightColumnRef} /* Đổi ref ở đây */
          style={{ gridTemplateRows: `${topRightPanelHeight} 10px 1fr` }} /* Style ở đây */
        >
        {/* Right: Code Editor */}
          <div 
            className={`editor-panel ${isEditorMaximized ? 'maximized' : ''} ${isEditorFolded ? 'folded' : ''}`}
            ref={codeContainerRef}
            style={{ flex: '1 1 60%' }} // Style flex mặc định
          >
            {/* Editor Header with Language and Buttons */}
            <div className="editor-header">
              <div className="editor-header-left">
                <h2>Code Editor</h2>
                <span className="lang-badge">{getLanguageDisplayName(lesson?.course?.language)}</span>
                <span className={`exec-time-badge ${executionTime === 0 ? 'default' : executionTime < 100 ? 'fast' : executionTime < 500 ? 'normal' : 'slow'}`}>
                  {executionTime === 0 ? '0ms' : `${executionTime.toFixed(0)}ms`}
                </span>
              </div>
              <div className="editor-header-right">
                  <button onClick={toggleEditorMaximize} className="control-btn" title="Maximize/Restore">
                      {isEditorMaximized ? <CompressIcon /> : <ExpandIcon />}
                  </button>
                  <button onClick={toggleEditorFold} className="control-btn" title="Fold/Unfold">
                      {isEditorFolded ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className={`editor-content-wrapper ${isEditorFolded ? 'hidden' : ''}`}>
            <div className="code-editor-container">
              <CodeEditor 
                code={code}
                onChange={setCode}
                language={convertDbToEditorLanguage(lesson?.course?.language)}
                disabled={isRunning}
                onSave={handleRunCode}
              />

              <div className="code-editor-actions">
                <button
                  className="btn btn-run"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  title="Run test cases"
                >
                  {isRunning ? "Running..." : "Run Code"}
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
                  Submit
                </button>
              </div>
                  
            </div>

            {/* Output Console */}
            <div className="output-panel">
              <div className="output-header">
                <span className="output-label">Output</span>
                <div className="output-info">
                  <span className={`output-status ${isRunning ? 'running' : ''}`}>
                    {isRunning ? "Running..." : "Ready"}
                  </span>
                  {executionTime > 0 && <span className="exec-time">Execution Time: {executionTime.toFixed(2)}ms</span>}
                </div>
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

          {!isEditorFolded && !isEditorMaximized && !isConsoleMaximized && (
          <div 
            className="horizontal-resizer-handle"
            // style={{ display: (isEditorFolded || isConsoleFolded || isEditorMaximized || isConsoleMaximized) ? 'none' : 'block' }}
            onMouseDown={handleHorizontalMouseDown}
          >
          </div>
          )}

          <div 
            className={`bottom-console-wrapper ${isConsoleMaximized ? 'maximized' : ''} ${isConsoleFolded ? 'folded' : ''}`}
            ref={testContainerRef}
            // style={{ flex: isEditorFolded ? '1 1 100%' : '1 1 40%' }}
          >
            <div className="console-header-controls">
                <h3>Test Cases ({publicTests.length})</h3>
                <div className="editor-header-right">
                    <button onClick={toggleConsoleMaximize} className="control-btn" title="Maximize/Restore">
                        {isConsoleMaximized ? <CompressIcon /> : <ExpandIcon />}
                    </button>
                    <button onClick={toggleConsoleFold} className="control-btn" title="Fold/Unfold">
                        {isConsoleFolded ? <ChevronDownIcon /> : <ChevronUpIcon />}
                    </button>
                </div>
            </div>

                  <div className={`console-content-wrapper ${isConsoleFolded ? 'hidden' : ''}`}>
                  {testCases.length > 0 && (
                    <div className="test-cases-section">
                      {(() => {
                        
                        return (
                          <>
                            
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