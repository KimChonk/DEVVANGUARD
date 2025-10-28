// src/pages/Lesson/LessonScreen.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/CSS/lessonscreen.css"; // Dùng file CSS cuối cùng ở Bước 2

export default function LessonScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/images/default-avatar.jpg",
  });

  // State cho Mobile View
  const [activeMobileTab, setActiveMobileTab] = useState('learn'); // 'learn', 'code', 'output'

  // Logic tải dữ liệu lesson (thay thế bằng API thật nếu cần)
  const [lesson] = useState(() => {
     const lessonsData = {
      1: {
        id: 1,
        title: "Python Variables & Data Types",
        difficulty: "Easy",
        tags: ["Variables", "Data Types", "Python Basics"],
        description: "Learn how to declare variables and work with different data types in Python. Master the fundamental building blocks of any Python program.",
        problem: "Create variables of different types and perform basic operations. Your code should define specific variables and print them in the expected format.",
        testCases: [
          { id: 1, name: "Test Case 1: Variable Declaration", description: "Create 'name' = 'Knight' and print it", expectedOutput: "Knight", hint: "Use print(name)." },
          { id: 2, name: "Test Case 2: Number Operations", description: "Create 'a = 10', 'b = 5', print their sum", expectedOutput: "15", hint: "Calculate a+b." },
          { id: 3, name: "Test Case 3: Boolean Values", description: "Create 'is_knight = True' and print it", expectedOutput: "True", hint: "Booleans are True or False." }
        ],
        initialCode: `# Knight's Python Challenge!\n# Complete the tasks below\n\n# Write your code here:\n\n`,
        hints: ["💡 Use meaningful names", "⚔️ Use print()", "🏰 Case-sensitive", "✨ Check assignments"]
      },
      2: {
        id: 2,
        title: "Control Flow with If Statements",
        difficulty: "Medium",
        tags: ["If Statements", "Control Flow", "Conditions"],
        description: "Master decision making in Python using if, elif, and else statements.",
        problem: "Create a system determining a knight's action based on conditions.",
        testCases: [
          { id: 1, name: "Test Case 1: High Health with Sword", description: "health=90, has_sword=True -> 'Attack!'", expectedOutput: "Attack!", hint: "Check health > 80 AND has_sword." },
          { id: 2, name: "Test Case 2: Low Health", description: "health=20 -> 'Retreat!'", expectedOutput: "Retreat!", hint: "Check health < 30." },
          { id: 3, name: "Test Case 3: Medium Health", description: "health=50, has_sword=False -> 'Defend!'", expectedOutput: "Defend!", hint: "Use an else or elif." }
        ],
        initialCode: `# Knight's Decision System\n\n# Test variables\nhealth = 90\nhas_sword = True\n\n# Write your if-elif-else logic here:\n\n`,
        hints: ["🗡️ Use 'and'", "🛡️ Check health first", "⚔️ Use elif", "🏰 Include an else"]
      }
      // Thêm các bài học khác nếu cần
    };

    return lessonsData[lessonId] || {
      id: 0,
      title: "Lesson Not Found",
      difficulty: "Easy",
      tags: ["Error"],
      description: "The requested lesson could not be found.",
      problem: "This lesson is not available.",
      testCases: [{ id: 1, name: "Error", description: "No test", expectedOutput: "Error", hint: "Select a valid lesson" }],
      initialCode: "# Lesson not found",
      hints: ["Go back and select a valid lesson"]
    };
  });

  // Các state khác
  const [code, setCode] = useState(lesson.initialCode);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // useEffect để reset state khi lesson thay đổi
  useEffect(() => {
    setCode(lesson.initialCode);
    setConsoleOutput([]);
    setTestResults([]);
    setIsLocked(false);
    setLockTimeRemaining(0);
    setShowHint(false);
    setCurrentHintIndex(0);
    setActiveMobileTab('learn'); // Reset về tab learn
  }, [lesson.initialCode, lesson.id]); // Phụ thuộc vào lesson.id

  // useEffect cho timer khóa
  useEffect(() => {
    let timer;
    if (isLocked && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setShowHint(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup
  }, [isLocked, lockTimeRemaining]);

  // Các hàm callback
  const handleBackToCourse = useCallback(() => navigate("/main-menu"), [navigate]);
  const clearConsole = useCallback(() => setConsoleOutput([]), []);
  const addToConsole = useCallback((message, type = 'output') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'});
    setConsoleOutput(prev => [...prev, { message, type, timestamp }]);
  }, []);

  // Mô phỏng chạy code (nên thay bằng gọi backend)
  const runCode = useCallback(async () => {
    if (isLocked) {
      addToConsole(`Code editor is locked for ${lockTimeRemaining} more seconds`, 'warning');
      return;
    }
    setIsRunning(true);
    clearConsole();
    setActiveMobileTab('output'); // Chuyển sang tab output trên mobile
    try {
      addToConsole('Running your code...', 'output');
      // *** THAY BẰNG GỌI BACKEND ĐỂ CHẠY CODE ***
      await new Promise(resolve => setTimeout(resolve, 800)); // Mô phỏng độ trễ
      // (Logic mô phỏng output đơn giản)
      let simulatedOutput = "Simulated output based on code:\n"; // Default
      if (lesson.id === 1 && code.includes('print(name)')) simulatedOutput += "Knight\n";
      if (lesson.id === 1 && code.includes('print(a + b)')) simulatedOutput += "15\n";
      if (lesson.id === 1 && code.includes('print(is_knight)')) simulatedOutput += "True\n";
      if (lesson.id === 2 && code.includes('print("Attack!")')) simulatedOutput += "Attack!\n"; // Simplified
      // Add more simulation logic or parse print statements

      if (simulatedOutput !== "Simulated output based on code:\n") {
           addToConsole(simulatedOutput.trim(), 'output');
           addToConsole('Code executed successfully! ✨', 'success');
      } else {
         addToConsole('No output generated or simulation not matched. Did you use print()?', 'warning');
      }
    } catch (error) { addToConsole(`Execution Error: ${error.message}`, 'error');
    } finally { setIsRunning(false); }
  }, [code, lesson.id, addToConsole, clearConsole, isLocked, lockTimeRemaining]); // Added lesson.id dependency

  // Mô phỏng kiểm tra code (nên thay bằng kết quả từ backend)
  const validateCode = useCallback(() => {
    // *** THAY BẰNG KẾT QUẢ TỪ BACKEND ***
     const results = lesson.testCases.map(testCase => {
      let passed = false;
      let actualOutput = 'Simulation Error'; // Default error

      // Lesson 1 Simulation
      if (lesson.id === 1) {
          if (testCase.id === 1 && code.includes('name = "Knight"') && code.includes('print(name)')) { passed = true; actualOutput = 'Knight'; }
          else if (testCase.id === 2 && code.includes('a = 10') && code.includes('b = 5') && code.includes('print(a + b)')) { passed = true; actualOutput = '15'; }
          else if (testCase.id === 3 && code.includes('is_knight = True') && code.includes('print(is_knight)')) { passed = true; actualOutput = 'True'; }
          else { actualOutput = 'Code does not match expected pattern.';} // Catch-all for failed
      }
      // Lesson 2 Simulation
      else if (lesson.id === 2) {
           // Basic check for keywords, actual output simulation is hard here
           if (testCase.id === 1 && code.includes('if health > 80 and has_sword') && code.includes('print("Attack!")')) { passed = true; actualOutput = 'Attack!'; }
           else if (testCase.id === 2 && code.includes('elif health < 30') && code.includes('print("Retreat!")')) { passed = true; actualOutput = 'Retreat!'; }
           else if (testCase.id === 3 && code.includes('else') && code.includes('print("Defend!")')) { passed = true; actualOutput = 'Defend!'; }
           else { actualOutput = 'Conditional logic simulation failed.'; }
      }

      return { ...testCase, passed, actualOutput };
    });
    setTestResults(results);
    return results;
  }, [code, lesson]);

  // Submit code (nên gọi backend)
  const submitCode = useCallback(() => {
    if (isLocked) { addToConsole(`Submission locked for ${lockTimeRemaining} more seconds`, 'warning'); return; }
    setIsRunning(true);
    clearConsole();
    addToConsole('Validating your solution...', 'output');
    setActiveMobileTab('output');
    // *** THAY BẰNG GỌI BACKEND ***
    setTimeout(() => { // Mô phỏng độ trễ API
      const results = validateCode();
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      if (passedCount === totalCount) {
          addToConsole(`🏆 Excellent! All ${totalCount} test cases passed!`, 'success');
          addToConsole('You earned 100 XP!', 'success');
      } else {
          addToConsole(`❌ ${passedCount}/${totalCount} test cases passed`, 'error');
          addToConsole('Editor locked for 10 seconds. Check hints!', 'warning');
          setIsLocked(true); setLockTimeRemaining(10); setShowHint(true);
          setCurrentHintIndex(prev => (prev + 1) % lesson.hints.length);
      }
      setIsRunning(false);
    }, 1200);
  }, [isLocked, lockTimeRemaining, addToConsole, clearConsole, validateCode, lesson.hints.length]);

  // Reset code
  const resetCode = useCallback(() => {
    if(window.confirm("Are you sure you want to reset your code?")){
        setCode(lesson.initialCode); clearConsole(); setTestResults([]);
        addToConsole('Code reset to initial state.', 'output');
    }
  }, [lesson.initialCode, clearConsole, addToConsole]);

  // Hàm helper cho class difficulty
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
  };

  return (
    <div className="lesson-screen-container">
      <div className="lesson-background"></div>

      {/* ===== Navbar Desktop (Chỉ hiện trên desktop) ===== */}
      <nav className="lesson-navbar desktop-only">
        <div className="lesson-nav-container">
          <button className="back-btn" onClick={handleBackToCourse}>
            <i className="fas fa-arrow-left"></i> <span>Back to Course</span>
          </button>
          <h1 className="lesson-nav-title">{lesson.title}</h1>
          <div className="lesson-nav-right">
            <img
              src={user.avatar} alt="User Avatar" className="user-avatar"
              onError={(e) => { e.target.src = "/icons/knight_icon.png"; }}
            />
          </div>
        </div>
      </nav>

      {/* ===== Navbar Mobile (Chỉ hiện trên mobile) ===== */}
      <nav className="mobile-lesson-navbar mobile-only">
        <div className="mobile-nav-left">
          <div className="mobile-logo">
             <img src="/icons/knight_icon.png" alt="Logo" style={{ width: '30px', height: '30px' }} />
          </div>
        </div>
        <div className="mobile-tabs">
          <button className={`mobile-tab ${activeMobileTab === 'learn' ? 'active' : ''}`} onClick={() => setActiveMobileTab('learn')}>Learn</button>
          <button className={`mobile-tab ${activeMobileTab === 'code' ? 'active' : ''}`} onClick={() => setActiveMobileTab('code')}>Code</button>
          <button className={`mobile-tab ${activeMobileTab === 'output' ? 'active' : ''}`} onClick={() => setActiveMobileTab('output')}>Output</button>
        </div>
        <div className="mobile-nav-right">
          <button className="mobile-hamburger"><i className="fas fa-bars"></i></button>
        </div>
      </nav>

      {/* ===== Nội dung chính ===== */}
      <div className="lesson-main-content">

        {/* --- PANEL HỌC (Luôn thấy trên desktop, tab trên mobile) --- */}
        <div className={`lesson-learn-panel ${activeMobileTab !== 'learn' ? 'mobile-hidden' : ''}`}>
           {/* Mobile subheader */}
           <div className="mobile-only mobile-lesson-subheader"><span>Exercise</span></div>
           {/* Desktop header */}
           <div className="lesson-header desktop-only">
             <h1 className="lesson-title">{lesson.title}</h1>
             <div className="lesson-difficulty">
               <span className={`difficulty-badge ${getDifficultyClass(lesson.difficulty)}`}>{lesson.difficulty}</span>
               <div className="lesson-tags">{lesson.tags.map((tag, index) => <span key={index} className="lesson-tag">{tag}</span>)}</div>
             </div>
           </div>
           {/* Khu vực nội dung cuộn được */}
           <div className="lesson-content">
             {/* Mobile Title */}
             <h2 className="mobile-only mobile-lesson-title">{lesson.id}. {lesson.title}</h2>
             <p className="mobile-only mobile-lesson-language"># {lesson.tags.includes("Python Basics") ? "Python" : (lesson.tags.includes("Java") ? "Java" : "Code")}</p>
             {/* Problem Description */}
             <div className="lesson-section">
               <h3 className="section-title desktop-only">📜 Problem Description</h3>
               <p className="lesson-description desktop-only">{lesson.problem}</p>
               <p className="lesson-description mobile-only">{lesson.description} 🚀</p>
               {/* <img src="/images/java_example.png" alt="Java Coffee" className="mobile-only lesson-illustration"/> */}
             </div>
             {/* Test Cases & Hints chỉ trên Desktop */}
             <div className="lesson-section desktop-only">
               <h3 className="section-title">🧪 Test Cases</h3>
               {lesson.testCases.map((testCase) => {
                 const result = testResults.find(r => r.id === testCase.id);
                 return (
                   <div key={testCase.id} className={`test-case-box ${result ? (result.passed ? 'test-passed' : 'test-failed') : 'test-pending'}`}>
                     <div className="test-case-header">
                       <span className="test-case-name">{testCase.name}</span>
                       <span className={`test-status ${result ? (result.passed ? 'status-passed' : 'status-failed') : 'status-pending'}`}>{result ? (result.passed ? '✅' : '❌') : '⏳'}</span>
                     </div>
                     <div className="test-details">
                       <p className="test-case-description">{testCase.description}</p>
                       <div className="test-case-output">
                         <div className="expected-output"><strong>Expected:</strong> <code>{testCase.expectedOutput}</code></div>
                         {result && (<div className={`actual-output ${result.passed ? 'output-correct' : 'output-incorrect'}`}><strong>Your output:</strong> <code>{result.actualOutput || 'No output'}</code></div>)}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
             {showHint && (
               <div className="lesson-section hint-section desktop-only">
                 <h3 className="section-title">💡 Knight's Assistant</h3>
                 <div className="hint-box">
                   <div className="hint-header">
                     <span className="hint-title">Need some guidance?</span>
                     <span className="lockout-timer">🔒 {lockTimeRemaining}s</span>
                   </div>
                   <p className="hint-text">{lesson.hints[currentHintIndex]}</p>
                   <div className="hint-navigation">
                     <button className="hint-nav-btn" onClick={() => setCurrentHintIndex(prev => prev > 0 ? prev - 1 : lesson.hints.length - 1)}>← Prev</button>
                     <span className="hint-counter">{currentHintIndex + 1}/{lesson.hints.length}</span>
                     <button className="hint-nav-btn" onClick={() => setCurrentHintIndex(prev => (prev + 1) % lesson.hints.length)}>Next →</button>
                   </div>
                 </div>
               </div>
             )}
             {/* Nút "Start Coding" cho mobile */}
             <button className="mobile-only start-coding-btn" onClick={() => setActiveMobileTab('code')}>
               <i className="fas fa-code"></i> Start coding
             </button>
           </div>
        </div>

        {/* === THẺ BAO BỌC CHO PHẦN BÊN PHẢI DESKTOP === */}
        <div className="lesson-right-wrapper desktop-only-flex">
            {/* --- PANEL CODE (Một phần bên phải desktop) --- */}
            <div className="lesson-code-panel">
                <div className="editor-header">
                     <div className="editor-tabs">
                       <div className="editor-tab active"><i className="fas fa-code"></i> Solution.{lesson.tags.includes("Python Basics") ? 'py' : 'java'}</div>
                     </div>
                     <div className="editor-actions">
                        <button className="run-btn" onClick={runCode} disabled={isRunning || isLocked}>
                           <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                           <span className="desktop-only">{isRunning ? 'Running...' : 'Run Code'}</span>
                           {/* Mobile text handled in CSS */}
                        </button>
                        <button className="submit-btn" onClick={submitCode} disabled={isLocked || isRunning}>
                           <i className="fas fa-check"></i>
                           <span className="desktop-only">{isLocked ? `Locked (${lockTimeRemaining}s)` : 'Submit'}</span>
                           {/* Mobile text handled in CSS */}
                        </button>
                        <button className="reset-btn" onClick={resetCode} disabled={isLocked}>
                           <i className="fas fa-undo"></i> <span className="desktop-only">Reset</span>
                        </button>
                     </div>
                </div>
                <div className="editor-content">
                     <textarea
                       className={`code-editor ${isLocked ? 'editor-locked' : ''}`}
                       value={code}
                       onChange={(e) => setCode(e.target.value)}
                       placeholder="Write your code here..."
                       spellCheck={false}
                       disabled={isLocked}
                     />
                </div>
            </div>
            {/* --- PANEL OUTPUT (Một phần bên phải desktop) --- */}
            <div className="lesson-output-panel">
                <div className="console-section">
                    <div className="console-header">
                        <h3 className="console-title">🖥️ Console Output</h3>
                        <button className="clear-console-btn" onClick={clearConsole}><i className="fas fa-trash"></i> <span className="desktop-only">Clear</span></button>
                    </div>
                    <div className="console-output">
                        {consoleOutput.length === 0 ? ( <div className="console-empty">Click "Run Code" to see output...</div> )
                         : ( consoleOutput.map((line, index) => ( <div key={index} className={`console-line ${line.type}`}><span className="console-timestamp">[{line.timestamp}]</span> {line.message}</div> )))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- CÁC PANEL CHỈ DÀNH CHO MOBILE (Hiển thị riêng lẻ) --- */}
         <div className={`lesson-code-panel mobile-only-flex ${activeMobileTab !== 'code' ? 'mobile-hidden' : ''}`}>
             <div className="editor-header">
                 <div className="editor-actions">
                    <button className="run-btn" onClick={runCode} disabled={isRunning || isLocked}>
                       <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                       <span className="mobile-only">Run</span>
                    </button>
                    <button className="submit-btn" onClick={submitCode} disabled={isLocked || isRunning}>
                       <i className="fas fa-check"></i>
                       <span className="mobile-only">{isLocked ? `(${lockTimeRemaining}s)` : 'Submit'}</span>
                    </button>
                    <button className="reset-btn" onClick={resetCode} disabled={isLocked}>
                       <i className="fas fa-undo"></i> {/* Chỉ icon */}
                    </button>
                 </div>
             </div>
             <div className="editor-content">
                 <textarea
                   className={`code-editor ${isLocked ? 'editor-locked' : ''}`}
                   value={code} onChange={(e) => setCode(e.target.value)}
                   placeholder="Write your code here..." spellCheck={false} disabled={isLocked}
                 />
             </div>
         </div>
         <div className={`lesson-output-panel mobile-only-flex ${activeMobileTab !== 'output' ? 'mobile-hidden' : ''}`}>
             <div className="console-section">
                 <div className="console-header">
                    <h3 className="console-title">🖥️ Console Output</h3>
                    <button className="clear-console-btn" onClick={clearConsole}><i className="fas fa-trash"></i></button>
                 </div>
                 <div className="console-output">
                    {consoleOutput.length === 0 ? ( <div className="console-empty">Click "Run Code" to see output...</div> )
                         : ( consoleOutput.map((line, index) => ( <div key={index} className={`console-line ${line.type}`}><span className="console-timestamp">[{line.timestamp}]</span> {line.message}</div> )))}
                 </div>
             </div>
             {/* Test cases và Hints chỉ hiển thị ở đây trên mobile */}
             <div className="lesson-section mobile-test-cases">
                 <h3 className="section-title">🧪 Test Cases</h3>
                 {lesson.testCases.map((testCase) => {
                     const result = testResults.find(r => r.id === testCase.id);
                      return (
                       <div key={testCase.id} className={`test-case-box ${result ? (result.passed ? 'test-passed' : 'test-failed') : 'test-pending'}`}>
                         <div className="test-case-header">
                           <span className="test-case-name">{testCase.name}</span>
                           <span className={`test-status ${result ? (result.passed ? 'status-passed' : 'status-failed') : 'status-pending'}`}>{result ? (result.passed ? '✅' : '❌') : '⏳'}</span>
                         </div>
                         <div className="test-details">
                           <p className="test-case-description">{testCase.description}</p>
                           <div className="test-case-output">
                             <div className="expected-output"><strong>Expected:</strong> <code>{testCase.expectedOutput}</code></div>
                             {result && (<div className={`actual-output ${result.passed ? 'output-correct' : 'output-incorrect'}`}><strong>Your output:</strong> <code>{result.actualOutput || 'No output'}</code></div>)}
                           </div>
                         </div>
                       </div>
                     );
                 })}
             </div>
             {showHint && (
               <div className="lesson-section hint-section mobile-hint">
                 <h3 className="section-title">💡 Knight's Assistant</h3>
                 <div className="hint-box">
                   <div className="hint-header">
                     <span className="hint-title">Need some guidance?</span>
                     <span className="lockout-timer">🔒 {lockTimeRemaining}s</span>
                   </div>
                   <p className="hint-text">{lesson.hints[currentHintIndex]}</p>
                   <div className="hint-navigation">
                     <button className="hint-nav-btn" onClick={() => setCurrentHintIndex(prev => prev > 0 ? prev - 1 : lesson.hints.length - 1)}>← Prev</button>
                     <span className="hint-counter">{currentHintIndex + 1}/{lesson.hints.length}</span>
                     <button className="hint-nav-btn" onClick={() => setCurrentHintIndex(prev => (prev + 1) % lesson.hints.length)}>Next →</button>
                   </div>
                 </div>
               </div>
             )}
         </div>

      </div> {/* Kết thúc lesson-main-content */}

      {/* Floating elements (Chỉ desktop) */}
       <div className="floating-elements desktop-only">{/* ... Nội dung floating elements ... */}</div>
    </div>
  );
}