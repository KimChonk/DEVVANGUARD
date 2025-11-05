import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonService } from "../../services/apiClient";
import { executeAndValidate, formatTestResults } from "../../services/pistonCompiler";
import { convertDbToEditorLanguage, convertDbToPistonLanguage, getLanguageDisplayName } from "../../utils/languageMapping";
import NPCChat from "../../components/NPCChat";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import Discussion from "../../components/Discussion";
import "../../assets/CSS/leetcode-lesson.css";

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

  // Sidebar panel state
  const [activeSidebarTab, setActiveSidebarTab] = useState(null); // null, 'description', 'discussion', 'hints', 'npc'

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
      // Get course language from lesson
      const dbLanguage = lesson?.course?.language;
      if (!dbLanguage) {
        setOutput("❌ Lỗi: Không tìm thấy ngôn ngữ của khóa học!");
        setNpcStatus("error");
        return;
      }

      // Convert DB language to Piston API language
      const language = convertDbToPistonLanguage(dbLanguage);
      const testCases = getTestCases();

      console.log(`🚀 Executing ${language} code with ${testCases.length} test cases...`);
      console.log(`📚 Course Language: ${dbLanguage} → Piston Language: ${language}`);

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
    <div className="lesson-screen-leetcode">
      {/* Header */}
      <header className="leetcode-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)} title="Quay lại">
            ←
          </button>
          <h1 className="lesson-title">{lesson?.lessonTitle || "Bài Học"}</h1>
        </div>
        
        <div className="header-right">
          {testResults && (
            <div className={`header-status ${testResults.success ? 'completed' : 'pending'}`}>
              {testResults.success ? "✅ Hoàn thành" : "⏳ Đang làm"}
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
              title="Mô tả bài toán"
            >
              📝
            </button>
            <button
              className={`tab-btn ${activeSidebarTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('discussion')}
              title="Discussion (Thảo luận)"
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
                  <h2>📝 Mô Tả Bài Toán</h2>
                  <div className="description-content">
                    <ProblemDescription description={lesson?.problemDescription} />
                  </div>

                  {/* Test Cases Preview */}
                  {testCases.length > 0 && (
                    <div className="test-cases-section">
                      <h3>🧪 Test Cases ({testCases.length})</h3>
                      <div className="test-cases-list">
                        {testCases.slice(0, 5).map((tc, idx) => (
                          <div key={idx} className="test-case-item">
                            <div className="test-label">Example {idx + 1}:</div>
                            <div className="test-io">
                              <div><strong>Input:</strong> <code>{tc.input || "N/A"}</code></div>
                              <div><strong>Output:</strong> <code>{tc.expected || tc.expected_output || "N/A"}</code></div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                  <h2>💡 Gợi Ý & Tips</h2>
                  <div className="hints-content">
                    <div className="hint-item">
                      <h3>Bước 1: Đọc kỹ bài toán</h3>
                      <p>Hãy chắc chắn rằng bạn hiểu tất cả các yêu cầu trước khi bắt đầu code.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Bước 2: Vạch kế hoạch</h3>
                      <p>Hãy vạch ra các bước giải quyết bài toán trước khi viết code.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Bước 3: Viết code từng phần</h3>
                      <p>Viết code theo từng phần nhỏ và test mỗi phần để tìm lỗi dễ dàng hơn.</p>
                    </div>
                    <div className="hint-item">
                      <h3>Gợi ý cho bài này:</h3>
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
                  <h2>🧙 Hướng Dẫn Từ NPC</h2>
                  <div className="npc-content">
                    <NPCChat 
                      feedback={npcMessage || "Xin chào, knight! Hãy bắt đầu cuộc phiêu lưu của bạn!"}
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

        {/* Right: Code Editor */}
        <div className="editor-panel">
          {/* Editor Header */}
          <div className="editor-header">
            <h2>💻 Code Editor</h2>
            <span className="lang-badge">{getLanguageDisplayName(lesson?.course?.language)}</span>
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

          {/* Output Console */}
          <div className="output-panel">
            <div className="output-header">
              <span className="output-label">📤 Output</span>
              <span className={`output-status ${isRunning ? 'running' : ''}`}>
                {isRunning ? "⏳ Running..." : "✓ Ready"}
              </span>
              {executionTime > 0 && <span className="exec-time">⏱️ {executionTime}ms</span>}
            </div>
            <pre className="output-content">{output}</pre>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-hint"
              onClick={handleHint}
              disabled={isRunning}
              title="Nhận gợi ý từ NPC"
            >
              💡 Gợi Ý
            </button>
            
            <button
              className="btn btn-run"
              onClick={handleRunCode}
              disabled={isRunning}
              title="Chạy test cases"
            >
              {isRunning ? "⏳ Chạy..." : "▶️ Chạy Code"}
            </button>
            
            <button
              className="btn btn-submit"
              onClick={() => {
                if (!testResults?.success) {
                  alert("⚠️ Vui lòng làm cho tất cả test cases pass!");
                  return;
                }
                alert("✅ Bạn đã hoàn thành bài học!");
                navigate(-1);
              }}
              disabled={isRunning || !testResults?.success}
              title="Nộp bài khi tất cả test pass"
            >
              ✅ Nộp Bài
            </button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className={`test-results ${testResults.success ? 'success' : 'failure'}`}>
              <div className="results-header">
                {testResults.success ? (
                  <>
                    <span className="result-icon">🎉</span>
                    <span>TẤT CẢ TEST PASSED!</span>
                  </>
                ) : (
                  <>
                    <span className="result-icon">❌</span>
                    <span>{testResults.passed}/{testResults.total} Test Passed</span>
                  </>
                )}
              </div>
              {testResults.results && testResults.results.length > 0 && (
                <div className="results-body">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.passed ? 'pass' : 'fail'}`}>
                      <span className="result-status">{result.passed ? "✅" : "❌"}</span>
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

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>⏳ Đang tải bài học...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-overlay">
          <div className="error-dialog">
            <h2>❌ Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>← Quay lại</button>
          </div>
        </div>
      )}
    </div>
  );
}