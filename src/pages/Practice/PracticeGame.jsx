import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pvpProblemService, userProgressPracticeService } from "../../services/apiClient";
import { executePracticeAndValidate, getCodeTemplate } from "../../services/pistonCompilerPractice";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import SuccessNotification from "../../components/SuccessNotification";
import AlertNotification from "../../components/AlertNotification";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/practicegame.css";

const LANGUAGE_OPTIONS = ['python', 'java', 'c', 'cpp'];

export default function PracticeGame() {
  const navigate = useNavigate();
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState("Output will display here...");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successXpReward, setSuccessXpReward] = useState(0);
  const [showAlertNotification, setShowAlertNotification] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  const getTestCases = () => {
    if (!problem || !problem.testCases) return [];
    if (typeof problem.testCases === 'string') {
      return JSON.parse(problem.testCases);
    }
    return problem.testCases;
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await pvpProblemService.getProblemById(problemId);
        if (result.success && result.data) {
          setProblem(result.data);
          setCode(result.data.solutionTemplate || getCodeTemplate('python'));
        } else {
          setError("Failed to load problem");
        }
      } catch (err) {
        setError("Failed to load problem: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem && !allTestsPassed) {
      const template = getCodeTemplate(language);
      setCode(template);
      setAllTestsPassed(false);
      setOutput("");
      setTestResults(null);
    }
  }, [language, allTestsPassed, problem]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running tests...');
    setAllTestsPassed(false);

    try {
      const testCases = getTestCases();
      if (testCases.length === 0) {
        setOutput('No test cases available');
        setIsRunning(false);
        return;
      }

      const result = await executePracticeAndValidate(language, code, testCases);
      setTestResults(result);
      setAllTestsPassed(result.allPassed);
      setOutput(result.output);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!allTestsPassed) {
      setShowAlertNotification(true);
      setAlertMessage("Please pass all tests before submitting!");
      return;
    }

    try {
      const result = await userProgressPracticeService.submitPractice(problemId);
      
      if (result.success && result.data) {
        const xpReward = result.data.xpReward || 20;
        setSuccessXpReward(xpReward);
        setSuccessMessage("Practice completed! Great job!");
        setShowSuccessNotification(true);

        setTimeout(() => {
          navigate("/practice");
        }, 3000);
      } else {
        setShowAlertNotification(true);
        setAlertMessage(result.message || "Failed to submit practice");
      }
    } catch (err) {
      setShowAlertNotification(true);
      setAlertMessage("Error submitting practice: " + err.message);
      console.error(err);
    }
  };

  const handleResetCode = () => {
    setCode(getCodeTemplate(language));
    setOutput("");
    setTestResults(null);
    setAllTestsPassed(false);
  };

  const handleMouseDownHorizontal = (e) => {
    e.preventDefault();
    setIsResizingHorizontal(true);
  };

  const handleMouseDownVertical = (e) => {
    e.preventDefault();
    setIsResizingVertical(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingHorizontal) {
        const main = document.querySelector('.leetcode-main');
        const problemPanel = document.querySelector('.problem-panel');
        if (main && problemPanel) {
          const mainRect = main.getBoundingClientRect();
          const newWidth = e.clientX - mainRect.left;
          if (newWidth > 200 && newWidth < mainRect.width - 200) {
            problemPanel.style.flex = `0 0 ${newWidth}px`;
            problemPanel.style.width = `${newWidth}px`; 
          }
        }
      }

      if (isResizingVertical) {
        const container = document.querySelector('.editor-panel');
        const outputPanel = document.querySelector('.practice-output-panel');
        const codeEditor = document.querySelector('.code-editor-container');

        if (container && outputPanel && codeEditor) {
          const containerRect = container.getBoundingClientRect();
          
          let newOutputHeight = containerRect.bottom - e.clientY;
          
          const minOutputHeight = 100; 
          const maxOutputHeight = containerRect.height - 100; 

          if (newOutputHeight < minOutputHeight) newOutputHeight = minOutputHeight;
          if (newOutputHeight > maxOutputHeight) newOutputHeight = maxOutputHeight;

          
          outputPanel.style.height = `${newOutputHeight}px`;
          outputPanel.style.flex = '0 0 auto';
          
          codeEditor.style.flex = '1 1 0%';
          codeEditor.style.height = 'auto'; 
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
      setIsResizingVertical(false);
      
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
      
      const overlay = document.getElementById('resize-overlay');
      if (overlay) overlay.remove();
    };

    if (isResizingHorizontal || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      document.body.style.userSelect = 'none';
      
      document.body.style.cursor = isResizingHorizontal ? 'col-resize' : 'row-resize';
      
      const overlay = document.createElement('div');
      overlay.id = 'resize-resize-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '9999';
      overlay.style.cursor = isResizingHorizontal ? 'col-resize' : 'row-resize';
      document.body.appendChild(overlay);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = 'default';
      const overlay = document.getElementById('resize-resize-overlay');
      if (overlay) overlay.remove();
    };
  }, [isResizingHorizontal, isResizingVertical]);

  if (loading) {
    return <LoadingScreen message="Loading problem..." />;
  }

  if (error) {
    return (
      <div className="practice-container">
        <div style={{ padding: '20px' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/practice")} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-screen-leetcode">
      <div className="leetcode-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/practice")} title="Go back">
            ←
          </button>
          <h1 className="lesson-title">{problem?.title || "Practice Problem"}</h1>
        </div>
        <div className="header-right">
          {allTestsPassed && (
            <div style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
              All Tests Passed
            </div>
          )}
        </div>
      </div>

      <div className="leetcode-main">
        {/* Left Panel */}
        <div className="problem-panel">
          <div className="problem-section">
            <h2>Problem Description</h2>
            <ProblemDescription 
              title={problem?.title} 
              description={problem?.problemDescription}
              testCases={getTestCases()}
            />
          </div>
        </div>

        <div 
          className="resize-divider-horizontal"
          onMouseDown={handleMouseDownHorizontal}
        />

        {/* Right Panel */}
        <div className="editor-panel">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="editor-header-left">
              <h2>Solution</h2>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRunning || allTestsPassed}
                className="lang-selector"
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="editor-header-right">
              <button 
                className="btn btn-run"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button 
                className="btn btn-reset"
                onClick={handleResetCode}
                disabled={isRunning}
              >
                Reset
              </button>
              <button 
                className="btn btn-submit"
                onClick={handleSubmitCode}
                disabled={!allTestsPassed || isRunning}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="code-editor-container">
            <CodeEditor 
              code={code} 
              onChange={setCode}
              language={language}
            />
          </div>

          <div 
            className="resize-divider-vertical"
            onMouseDown={handleMouseDownVertical}
          />

          {/* Output Panel */}
          <div className="practice-output-panel">
            <div className="output-header">
              <span>Output & Test Results</span>
            </div>
            <div className="practice-output-content">
              {testResults ? (
                <div className="practice-test-results">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className={`test-result-item ${result.passed ? 'passed' : 'failed'}`}>
                      <div className="test-result-header">
                        <span className={`test-badge ${result.passed ? 'pass' : 'fail'}`}>
                          {result.passed ? '✓' : '✗'}
                        </span>
                        <span className="test-name">Test {result.testNumber}: {result.passed ? 'PASSED' : 'FAILED'}</span>
                      </div>
                      {!result.passed && (
                        <div className="test-result-details">
                          <div className="test-expected">Expected: <code>{result.expectedOutput}</code></div>
                          <div className="test-actual">Got: <code>{result.actualOutput}</code></div>
                          {result.error && <div className="test-error">Error: {result.error}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="output-text">{output}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccessNotification && (
        <SuccessNotification 
          message={successMessage}
          xpReward={successXpReward}
          onClose={() => setShowSuccessNotification(false)}
        />
      )}
      {showAlertNotification && (
        <AlertNotification 
          message={alertMessage}
          onClose={() => setShowAlertNotification(false)}
        />
      )}
    </div>
  );
}
