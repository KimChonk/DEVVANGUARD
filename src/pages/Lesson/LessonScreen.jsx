import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/CSS/lessonscreen.css";

export default function LessonScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/images/default-avatar.jpg"
  });

  // Sample lesson data based on lessonId with test cases
  const [lesson] = useState({
    1: {
      id: 1,
      title: "Python Variables & Data Types",
      difficulty: "Easy",
      tags: ["Variables", "Data Types", "Python Basics"],
      description: "Learn how to declare variables and work with different data types in Python. Master the fundamental building blocks of any Python program.",
      problem: "Create variables of different types and perform basic operations. Your code should define specific variables and print them in the expected format.",
      testCases: [
        {
          id: 1,
          name: "Test Case 1: Variable Declaration",
          description: "Your code should create a variable 'name' with value 'Knight' and print it",
          expectedOutput: "Knight",
          hint: "Remember to create a variable called 'name' and assign it the string 'Knight', then use print() to display it."
        },
        {
          id: 2,
          name: "Test Case 2: Number Operations",
          description: "Create variables 'a = 10' and 'b = 5', then print their sum",
          expectedOutput: "15",
          hint: "Create two variables a=10 and b=5, then calculate a+b and print the result."
        },
        {
          id: 3,
          name: "Test Case 3: Boolean Values",
          description: "Create a boolean variable 'is_knight = True' and print it",
          expectedOutput: "True",
          hint: "Create a boolean variable called 'is_knight' with value True and print it."
        }
      ],
      initialCode: `# Knight's Python Challenge!
# Complete the tasks below to pass all test cases

# Write your code here:

`,
      hints: [
        "💡 Start by creating variables with meaningful names",
        "⚔️ Use print() function to display your results",
        "🏰 Remember Python is case-sensitive",
        "✨ Check your variable assignments carefully"
      ]
    },
    2: {
      id: 2,
      title: "Control Flow with If Statements",
      difficulty: "Medium",
      tags: ["If Statements", "Control Flow", "Conditions"],
      description: "Master the art of decision making in Python using if, elif, and else statements.",
      problem: "Create a decision system that determines a knight's action based on different conditions.",
      testCases: [
        {
          id: 1,
          name: "Test Case 1: High Health with Sword",
          description: "With health=90 and has_sword=True, should print 'Attack!'",
          expectedOutput: "Attack!",
          hint: "Check if health > 80 AND has_sword is True, then print 'Attack!'"
        },
        {
          id: 2,
          name: "Test Case 2: Low Health",
          description: "With health=20, should print 'Retreat!'",
          expectedOutput: "Retreat!",
          hint: "When health is less than 30, the knight should retreat for safety."
        },
        {
          id: 3,
          name: "Test Case 3: Medium Health",
          description: "With health=50 and has_sword=False, should print 'Defend!'",
          expectedOutput: "Defend!",
          hint: "For medium health without a sword, the best strategy is to defend."
        }
      ],
      initialCode: `# Knight's Decision System
# Create conditional logic for the knight's actions

# Test variables (your code should work for any values)
health = 90
has_sword = True

# Write your if-elif-else logic here:

`,
      hints: [
        "🗡️ Use 'and' to combine multiple conditions",
        "🛡️ Remember to check health levels first",
        "⚔️ Use elif for multiple conditions",
        "🏰 Always include an else clause for safety"
      ]
    }
  }[lessonId] || {
    id: 1,
    title: "Lesson Not Found",
    difficulty: "Easy",
    tags: ["Error"],
    description: "The requested lesson could not be found.",
    problem: "This lesson is not available. Please select a valid lesson.",
    testCases: [
      {
        id: 1,
        name: "Test Case 1: Error",
        description: "No test available",
        expectedOutput: "Error",
        hint: "Please select a valid lesson"
      }
    ],
    initialCode: "# Lesson not found",
    hints: ["Please go back and select a valid lesson"]
  });

  const [code, setCode] = useState(lesson.initialCode);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code when lesson changes
  useEffect(() => {
    setCode(lesson.initialCode);
    setConsoleOutput([]);
    setTestResults([]);
    setIsLocked(false);
    setShowHint(false);
  }, [lesson.initialCode]);

  // Lock timer effect
  useEffect(() => {
    let timer;
    if (isLocked && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setShowHint(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimeRemaining]);

  const handleBackToCourse = useCallback(() => {
    navigate("/course/1"); // Navigate back to course - you can make this dynamic
  }, [navigate]);

  const clearConsole = useCallback(() => {
    setConsoleOutput([]);
  }, []);

  const addToConsole = useCallback((message, type = 'output') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev, { message, type, timestamp }]);
  }, []);

  const runCode = useCallback(async () => {
    if (isLocked) {
      addToConsole(`Code editor is locked for ${lockTimeRemaining} more seconds`, 'warning');
      return;
    }

    setIsRunning(true);
    clearConsole();
    
    try {
      addToConsole('Running your code...', 'output');
      
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple Python code simulation
      const outputs = [];
      if (code.includes('print(')) {
        const printMatches = code.match(/print\([^)]*\)/g);
        if (printMatches) {
          printMatches.forEach(printStatement => {
            // Simple simulation - extract content between quotes or variable names
            let output = printStatement.replace(/print\(|\)/g, '');
            
            // Handle f-strings and simple variables
            if (output.includes('"')) {
              output = output.match(/"([^"]*)"/)?.[1] || output;
            } else if (output.includes("'")) {
              output = output.match(/'([^']*)'/)?.[1] || output;
            }
            
            outputs.push(output);
            addToConsole(output, 'output');
          });
        }
        
        addToConsole('Code executed successfully! ✨', 'success');
      } else {
        addToConsole('No output to display. Add some print statements!', 'warning');
      }
      
    } catch (error) {
      addToConsole(`Error: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [code, addToConsole, clearConsole, isLocked, lockTimeRemaining]);

  const validateCode = useCallback(() => {
    const results = lesson.testCases.map(testCase => {
      // Simple validation logic - in real implementation, you'd execute the code
      let passed = false;
      let actualOutput = '';
      
      // Basic validation based on test case requirements
      if (testCase.id === 1 && lesson.id === 1) {
        // Check for name variable and Knight value
        if (code.includes('name') && code.includes('Knight') && code.includes('print')) {
          passed = true;
          actualOutput = 'Knight';
        } else {
          actualOutput = 'No output or incorrect variable';
        }
      } else if (testCase.id === 2 && lesson.id === 1) {
        // Check for a=10, b=5, and sum calculation
        if (code.includes('a = 10') && code.includes('b = 5') && code.includes('a + b')) {
          passed = true;
          actualOutput = '15';
        } else {
          actualOutput = 'Incorrect calculation or missing variables';
        }
      } else if (testCase.id === 3 && lesson.id === 1) {
        // Check for boolean variable
        if (code.includes('is_knight') && code.includes('True') && code.includes('print')) {
          passed = true;
          actualOutput = 'True';
        } else {
          actualOutput = 'Missing boolean variable or print statement';
        }
      }
      
      // For lesson 2 (if statements)
      if (lesson.id === 2) {
        if (testCase.id === 1 && code.includes('if') && code.includes('health > 80') && code.includes('Attack!')) {
          passed = true;
          actualOutput = 'Attack!';
        } else if (testCase.id === 2 && code.includes('health') && code.includes('< 30') && code.includes('Retreat!')) {
          passed = true;
          actualOutput = 'Retreat!';
        } else if (testCase.id === 3 && code.includes('else') && code.includes('Defend!')) {
          passed = true;
          actualOutput = 'Defend!';
        }
      }
      
      return {
        ...testCase,
        passed,
        actualOutput
      };
    });
    
    setTestResults(results);
    return results;
  }, [code, lesson]);

  const submitCode = useCallback(() => {
    if (isLocked) {
      addToConsole(`Submission locked for ${lockTimeRemaining} more seconds`, 'warning');
      return;
    }

    clearConsole();
    addToConsole('Validating your solution...', 'output');
    
    setTimeout(() => {
      const results = validateCode();
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      if (passedCount === totalCount) {
        addToConsole(`🏆 Excellent! All ${totalCount} test cases passed!`, 'success');
        addToConsole('You have earned 100 XP for completing this lesson!', 'success');
        addToConsole('Ready to advance to the next challenge!', 'success');
      } else {
        addToConsole(`❌ ${passedCount}/${totalCount} test cases passed`, 'error');
        addToConsole('Code editor locked for 10 seconds. Check the hint!', 'warning');
        
        // Lock the editor and show hint
        setIsLocked(true);
        setLockTimeRemaining(10);
        setShowHint(true);
        
        // Cycle through hints
        setCurrentHintIndex(prev => (prev + 1) % lesson.hints.length);
      }
    }, 1200);
  }, [isLocked, lockTimeRemaining, addToConsole, clearConsole, validateCode, lesson.hints.length]);

  const resetCode = useCallback(() => {
    setCode(lesson.initialCode);
    clearConsole();
    addToConsole('Code reset to initial state.', 'output');
  }, [lesson.initialCode, clearConsole, addToConsole]);

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-easy';
    }
  };

  return (
    <div className="lesson-screen-container">
      <div className="lesson-background"></div>

      {/* Navigation */}
      <nav className="lesson-navbar">
        <div className="lesson-nav-container">
          <button className="back-btn" onClick={handleBackToCourse}>
            <i className="fas fa-arrow-left"></i> Back to Course
          </button>
          <h1 className="lesson-nav-title">{lesson.title}</h1>
          <div className="lesson-nav-right">
            <div className="lesson-progress-indicator">
              <span className="progress-text">Lesson {lesson.id}</span>
            </div>
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="user-avatar"
              onError={(e) => {
                e.target.src = "/icons/knight_icon.png";
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lesson-main-content">
        {/* Left Panel - Problem Description & Test Cases */}
        <div className="lesson-left-panel">
          <div className="lesson-header">
            <h1 className="lesson-title">{lesson.title}</h1>
            <div className="lesson-difficulty">
              <span className={`difficulty-badge ${getDifficultyClass(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <div className="lesson-tags">
                {lesson.tags.map((tag, index) => (
                  <span key={index} className="lesson-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="lesson-content">
            <div className="lesson-section">
              <h3 className="section-title">📜 Problem Description</h3>
              <p className="lesson-description">{lesson.problem}</p>
            </div>

            <div className="lesson-section">
              <h3 className="section-title">🧪 Test Cases</h3>
              {lesson.testCases.map((testCase, index) => {
                const result = testResults.find(r => r.id === testCase.id);
                return (
                  <div key={index} className={`test-case-box ${
                    result ? (result.passed ? 'test-passed' : 'test-failed') : 'test-pending'
                  }`}>
                    <div className="test-case-header">
                      <span className="test-case-name">{testCase.name}</span>
                      <span className={`test-status ${
                        result ? (result.passed ? 'status-passed' : 'status-failed') : 'status-pending'
                      }`}>
                        {result ? (result.passed ? '✅' : '❌') : '⏳'}
                      </span>
                    </div>
                    <p className="test-case-description">{testCase.description}</p>
                    <div className="test-case-output">
                      <div className="expected-output">
                        <strong>Expected:</strong> <code>{testCase.expectedOutput}</code>
                      </div>
                      {result && (
                        <div className={`actual-output ${
                          result.passed ? 'output-correct' : 'output-incorrect'
                        }`}>
                          <strong>Your output:</strong> <code>{result.actualOutput}</code>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint Section */}
            {showHint && (
              <div className="lesson-section hint-section">
                <h3 className="section-title">💡 Knight's Assistant</h3>
                <div className="hint-box">
                  <div className="hint-header">
                    <span className="hint-title">Need some guidance, brave knight?</span>
                    <span className="lockout-timer">🔒 {lockTimeRemaining}s</span>
                  </div>
                  <p className="hint-text">{lesson.hints[currentHintIndex]}</p>
                  <div className="hint-navigation">
                    <button 
                      className="hint-nav-btn" 
                      onClick={() => setCurrentHintIndex(prev => prev > 0 ? prev - 1 : lesson.hints.length - 1)}
                    >
                      ← Previous
                    </button>
                    <span className="hint-counter">{currentHintIndex + 1}/{lesson.hints.length}</span>
                    <button 
                      className="hint-nav-btn" 
                      onClick={() => setCurrentHintIndex(prev => (prev + 1) % lesson.hints.length)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="lesson-right-panel">
          <div className="editor-header">
            <div className="editor-tabs">
              <div className="editor-tab active">
                <i className="fas fa-code"></i> Solution.py
              </div>
            </div>
            <div className="editor-actions">
              <button className="run-btn" onClick={runCode} disabled={isRunning || isLocked}>
                <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button className="submit-btn" onClick={submitCode} disabled={isLocked}>
                <i className="fas fa-check"></i> 
                {isLocked ? `Locked (${lockTimeRemaining}s)` : 'Submit'}
              </button>
              <button className="reset-btn" onClick={resetCode} disabled={isLocked}>
                <i className="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>

          <div className="editor-content">
            <textarea
              className={`code-editor ${isLocked ? 'editor-locked' : ''}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your Python code here..."
              spellCheck={false}
              disabled={isLocked}
            />
          </div>

          {/* Console Output */}
          <div className="console-section">
            <div className="console-header">
              <h3 className="console-title">🖥️ Console Output</h3>
              <button className="clear-console-btn" onClick={clearConsole}>
                <i className="fas fa-trash"></i> Clear
              </button>
            </div>
            <div className="console-output">
              {consoleOutput.length === 0 ? (
                <div className="console-empty">
                  Click "Run Code" to see your output here...
                </div>
              ) : (
                consoleOutput.map((line, index) => (
                  <div key={index} className={`console-line ${line.type}`}>
                    <span style={{ opacity: 0.7, fontSize: '0.8em' }}>[{line.timestamp}]</span> {line.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-sword"></div>
        <div className="floating-shield"></div>
        <div className="floating-gem"></div>
        <div className="floating-scroll"></div>
      </div>
    </div>
  );
}