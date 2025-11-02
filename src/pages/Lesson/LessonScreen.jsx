import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonService } from "../../services/apiClient";
import { executeAndValidate, formatTestResults } from "../../services/pistonCompiler";
import NPCChat from "../../components/NPCChat";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import "../../assets/CSS/lessongame.css";

// NPC feedback for different lesson types
const npcFeedback = {
  helloWorld: {
    hint: "Sử dụng lệnh print() để in ra một chuỗi văn bản.",
    success: "Bạn đã chiến thắng! In ra thành công!",
    wrongOutput: "Output không khớp. Hãy kiểm tra lại.",
  },
  doubleNumber: {
    hint: "Đọc số từ input rồi nhân nó với 2.",
    success: "Chiến thắng! Phép nhân hoàn hảo!",
    wrongOutput: "Kết quả sai. Nhân lại xem sao.",
  },
  sumNumbers: {
    hint: "Cộng tất cả các số lại với nhau.",
    success: "Chiến thắng! Bạn thống trị phép cộng!",
    wrongOutput: "Tính toán sai. Thử lại nào!",
  },
  default: {
    hint: "Suy nghĩ kỹ về logic của bài toán.",
    success: "Chiến thắng! Bạn rất giỏi!",
    wrongOutput: "Chưa đúng. Hãy thử lại!",
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

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching lesson ${lessonId}...`);
        const result = await lessonService.getLessonById(lessonId);
        
        if (result.success) {
          console.log("✅ Lesson fetched:", result.data);
          setLesson(result.data);
          
          // Initialize code with template
          if (result.data.solutionTemplate) {
            setCode(result.data.solutionTemplate);
          }
          
          // Show welcome message
          setNpcStatus("welcome");
          setShowNpc(true);
        } else {
          console.error("❌ Fetch failed:", result.message);
          setError(result.message);
        }
      } catch (err) {
        console.error("❌ Error:", err);
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
    setOutput("⏳ Đang chạy code...");
    setTestResults(null);
    setExecutionTime(0);
    setNpcStatus("thinking");
    setShowNpc(true);
    
    try {
      // Detect language from course or default to python
      const language = lesson?.courseId ? "python" : "python";
      const testCases = getTestCases();

      console.log(`🚀 Executing ${language} code with ${testCases.length} test cases...`);

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
        setOutput(`❌ Execution Error:\n${result.execution.stderr}`);
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
      console.error("❌ Error:", err);
      setOutput(`❌ Lỗi: ${err.message}`);
      setNpcMessage(`❌ Có lỗi xảy ra: ${err.message}`);
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
    <div className="lesson-game-container">
      {/* Background Effects */}
      <div className="game-background">
        <div className="bg-gradient"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Header Bar */}
      <header className="game-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        
        <div className="header-center">
          <h1 className="level-title">🗡️ {lesson?.lessonTitle || "Bài Học"}</h1>
          <p className="level-number">Bài #{lesson?.lessonOrder || "?"}</p>
        </div>
        
        <div className="header-right">
          {testResults && (
            <div className={`quest-status ${testResults.success ? 'completed' : 'active'}`}>
              {testResults.success ? "✅ HOÀN THÀNH" : "⚔️ ĐANG CHIẾN"}
            </div>
          )}
        </div>
      </header>

      {/* Main Game Area */}
      <div className="game-main">
        {/* Left Panel - Quest Display (60%) */}
        <section className="quest-panel">
          {/* Container 1: Problem Description (40% of quest-panel) */}
          <div className="problem-container">
            <div className="quest-header">
              <h2>⚔️ Nhiệm Vụ</h2>
              <span className="quest-badge">Quest #{lesson?.lessonOrder}</span>
            </div>
            
            <div className="quest-description">
              <ProblemDescription description={lesson?.problemDescription} />
            </div>
          </div>

          {/* Container 2: Test Cases (25% of quest-panel) */}
          <div className="testcases-container">
            {testCases.length > 0 && (
              <div className="test-cases-preview">
                {(() => {
                  const publicTests = testCases.filter(tc => !tc.hidden);
                  const hiddenTests = testCases.filter(tc => tc.hidden);
                  return (
                    <>
                      <h3>🧪 Test Cases ({publicTests.length} public, {hiddenTests.length} hidden)</h3>
                      <div className="test-cases-grid">
                        {publicTests.slice(0, 3).map((tc, idx) => (
                          <div 
                            key={idx} 
                            className={`test-case-card ${testResults?.results?.[idx]?.passed ? 'passed' : ''}`}
                          >
                            <div className="test-badge">Test {idx + 1}</div>
                            <div className="test-input">
                              <span className="label">Input:</span>
                              <code>{tc.input || "N/A"}</code>
                            </div>
                            <div className="test-output">
                              <span className="label">Expected:</span>
                              <code>{tc.expected || tc.expected_output || "N/A"}</code>
                            </div>
                            {testResults?.results?.[idx] && (
                              <div className={`test-result ${testResults.results[idx].passed ? 'success' : 'fail'}`}>
                                {testResults.results[idx].passed ? "✅ PASSED" : "❌ FAILED"}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Container 3: NPC Chat (35% of quest-panel) */}
          <div className="npc-container">
            <NPCChat 
              feedback={npcMessage}
              status={npcStatus}
              problemDescription={lesson?.problemDescription || ''}
              userCode={code}
            />
          </div>
        </section>

        {/* Right Panel - Code Editor (40%) */}
        <section className="editor-panel">
        <div className="editor-header">
          <h2>💻 Code Arena</h2>
          <span className="editor-hint">Python 3.10</span>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <CodeEditor 
            code={code}
            onChange={setCode}
            language="python"
            disabled={isRunning}
            onSave={handleRunCode}
          />
        </div>

        {/* Output Console */}
        <div className="output-console">
          <div className="console-header">
            <span className="console-label">📤 Output</span>
            <span className={`console-status ${isRunning ? 'running' : 'idle'}`}>
              {isRunning ? "⏳ Đang chạy..." : "✓ Ready"}
            </span>
            {executionTime > 0 && (
              <span className="execution-time">⏱️ {executionTime}ms</span>
            )}
          </div>
          <pre className="console-output">{output}</pre>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-hint"
            onClick={handleHint}
            disabled={isRunning}
          >
            💡 Gợi Ý
          </button>
          
          <button
            className="btn btn-run"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? "⏳ Đang chạy..." : "▶️ Chạy Code"}
          </button>
          
          <button
            className="btn btn-submit"
            onClick={() => {
              if (!testResults?.success) {
                alert("⚠️ Vui lòng làm cho tất cả test cases pass trước khi nộp bài!");
                return;
              }
              alert("✅ Bạn đã hoàn thành bài học! Chúc mừng, Knight!");
              navigate(-1);
            }}
            disabled={isRunning}
          >
            ✅ Nộp Bài
          </button>
        </div>

        {/* Test Results Card */}
        {testResults && (
          <div className={`results-card ${testResults.success ? 'success' : 'failure'}`}>
              <div className="results-header">
                <span className="results-icon">
                  {testResults.success ? "🎉" : "⚡"}
                </span>
                <span className="results-text">
                  {testResults.success 
                    ? "🏆 TẤT CẢ TEST PASSED!" 
                    : `❌ ${testResults.passed}/${testResults.total} Test Pass`}
                </span>
              </div>
              
              {testResults.results && testResults.results.length > 0 && (
                <div className="results-details">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className={`result-row ${result.passed ? 'pass' : 'fail'}`}>
                      <span className="result-icon">
                        {result.passed ? "✅" : "❌"}
                      </span>
                      <span className="result-name">{result.name}</span>
                      <div className="result-values">
                        <div className="expected">
                          Expected: <code>{result.expected}</code>
                        </div>
                        <div className="actual">
                          Got: <code>{result.actual}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        )}
      </section>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>⏳ Đang tải bài học...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-screen">
          <div className="error-content">
            <h2>❌ Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>← Quay lại</button>
          </div>
        </div>
      )}
    </div>
  );
}