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

  // Sample lesson data based on lessonId
  const [lesson] = useState({
    1: {
      id: 1,
      title: "Python Variables & Data Types",
      difficulty: "Easy",
      tags: ["Variables", "Data Types", "Python Basics"],
      description: "Learn how to declare variables and work with different data types in Python. Master the fundamental building blocks of any Python program.",
      objectives: [
        "Understand variable declaration in Python",
        "Learn about different data types (int, float, string, boolean)",
        "Practice variable assignment and manipulation",
        "Write your first Python program with variables"
      ],
      examples: [
        {
          title: "Example 1: Basic Variable Declaration",
          code: `# Declaring different types of variables
name = "Knight Coder"
age = 25
height = 5.9
is_student = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}")
print(f"Is Student: {is_student}")`
        },
        {
          title: "Example 2: Variable Operations",
          code: `# Mathematical operations with variables
a = 10
b = 3

sum_result = a + b
difference = a - b
product = a * b
quotient = a / b

print(f"Sum: {sum_result}")
print(f"Difference: {difference}")
print(f"Product: {product}")
print(f"Quotient: {quotient}")`
        }
      ],
      constraints: [
        "Use meaningful variable names",
        "Follow Python naming conventions (snake_case)",
        "Variables should not start with numbers",
        "Avoid using Python reserved keywords as variable names"
      ],
      initialCode: `# Welcome to your Python adventure, Knight!
# Complete the following tasks:

# Task 1: Create a variable called 'knight_name' and assign your name to it
knight_name = 

# Task 2: Create a variable called 'level' and assign the number 1 to it
level = 

# Task 3: Create a variable called 'experience_points' and assign 0.0 to it
experience_points = 

# Task 4: Create a variable called 'has_sword' and assign True to it
has_sword = 

# Task 5: Print all variables using f-strings
# Example: print(f"Knight Name: {knight_name}")

# Your code here:


# Task 6: Calculate new experience points by adding 50.5 to current experience_points
# and assign it back to experience_points

# Your code here:


# Task 7: Print the updated experience points

# Your code here:
`,
      solution: `# Welcome to your Python adventure, Knight!
# Complete the following tasks:

# Task 1: Create a variable called 'knight_name' and assign your name to it
knight_name = "Knight Coder"

# Task 2: Create a variable called 'level' and assign the number 1 to it
level = 1

# Task 3: Create a variable called 'experience_points' and assign 0.0 to it
experience_points = 0.0

# Task 4: Create a variable called 'has_sword' and assign True to it
has_sword = True

# Task 5: Print all variables using f-strings
print(f"Knight Name: {knight_name}")
print(f"Level: {level}")
print(f"Experience Points: {experience_points}")
print(f"Has Sword: {has_sword}")

# Task 6: Calculate new experience points by adding 50.5 to current experience_points
experience_points = experience_points + 50.5

# Task 7: Print the updated experience points
print(f"Updated Experience Points: {experience_points}")`
    },
    2: {
      id: 2,
      title: "Control Flow with If Statements",
      difficulty: "Medium",
      tags: ["If Statements", "Control Flow", "Conditions"],
      description: "Master the art of decision making in Python using if, elif, and else statements.",
      objectives: [
        "Understand conditional statements",
        "Learn comparison operators",
        "Practice if-elif-else chains",
        "Create decision-based programs"
      ],
      examples: [
        {
          title: "Example: Grade Checker",
          code: `score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Your grade is: {grade}")`
        }
      ],
      constraints: [
        "Use proper indentation (4 spaces)",
        "Include meaningful condition checks",
        "Handle edge cases appropriately"
      ],
      initialCode: `# Knight's Adventure Decision System
# Help the knight make important decisions!

# Task: Create a decision system for a knight's adventure

# Given variables (you can modify these for testing)
knights_health = 100
has_magic_sword = True
enemy_strength = 75
has_healing_potion = False

# Your task: Write if-elif-else statements to determine the knight's action
# Rules:
# 1. If health > 80 and has_magic_sword: "Charge into battle!"
# 2. If health > 50 and enemy_strength < 50: "Attack with caution!"
# 3. If health < 30 and has_healing_potion: "Use healing potion!"
# 4. If health < 30 and not has_healing_potion: "Retreat to safety!"
# 5. Otherwise: "Defend and wait for opportunity!"

# Write your code here:

`,
      solution: `# Knight's Adventure Decision System
# Help the knight make important decisions!

# Given variables
knights_health = 100
has_magic_sword = True
enemy_strength = 75
has_healing_potion = False

# Decision system
if knights_health > 80 and has_magic_sword:
    action = "Charge into battle!"
elif knights_health > 50 and enemy_strength < 50:
    action = "Attack with caution!"
elif knights_health < 30 and has_healing_potion:
    action = "Use healing potion!"
elif knights_health < 30 and not has_healing_potion:
    action = "Retreat to safety!"
else:
    action = "Defend and wait for opportunity!"

print(f"Knight's decision: {action}")
print(f"Health: {knights_health}, Magic Sword: {has_magic_sword}")
print(f"Enemy Strength: {enemy_strength}, Healing Potion: {has_healing_potion}")`
    }
  }[lessonId] || {
    id: 1,
    title: "Lesson Not Found",
    difficulty: "Easy",
    tags: ["Error"],
    description: "The requested lesson could not be found.",
    objectives: [],
    examples: [],
    constraints: [],
    initialCode: "# Lesson not found",
    solution: "# Lesson not found"
  });

  const [code, setCode] = useState(lesson.initialCode);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [activeTab, setActiveTab] = useState('code');
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code when lesson changes
  useEffect(() => {
    setCode(lesson.initialCode);
    setConsoleOutput([]);
  }, [lesson.initialCode]);

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
    setIsRunning(true);
    clearConsole();
    
    try {
      addToConsole('Running your code...', 'output');
      
      // Simulate code execution (in a real app, you'd send this to a backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple Python code simulation
      if (code.includes('print(')) {
        // Extract print statements and simulate output
        const printMatches = code.match(/print\([^)]*\)/g);
        if (printMatches) {
          printMatches.forEach((printStatement, index) => {
            setTimeout(() => {
              // Simple simulation - in reality you'd need a proper Python interpreter
              const output = printStatement.replace(/print\(|\)/g, '').replace(/f?["']/g, '');
              addToConsole(output, 'output');
            }, (index + 1) * 200);
          });
        }
        
        setTimeout(() => {
          addToConsole('Code executed successfully! ✨', 'success');
        }, (printMatches?.length || 1) * 200 + 500);
      } else {
        setTimeout(() => {
          addToConsole('No output to display. Add some print statements!', 'warning');
        }, 1000);
      }
      
    } catch (error) {
      addToConsole(`Error: ${error.message}`, 'error');
    } finally {
      setTimeout(() => setIsRunning(false), 1500);
    }
  }, [code, addToConsole, clearConsole]);

  const submitCode = useCallback(() => {
    clearConsole();
    addToConsole('Submitting your solution...', 'output');
    
    // Simple validation (in a real app, this would be more sophisticated)
    setTimeout(() => {
      if (code.trim().length > lesson.initialCode.trim().length) {
        addToConsole('Great work, Knight! Your solution has been submitted! 🏆', 'success');
        addToConsole('You have earned 50 XP for completing this lesson!', 'success');
      } else {
        addToConsole('Please complete the tasks before submitting.', 'warning');
      }
    }, 1000);
  }, [code, lesson.initialCode, addToConsole, clearConsole]);

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
        {/* Left Panel - Problem Description */}
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
              <p className="lesson-description">{lesson.description}</p>
            </div>

            <div className="lesson-section">
              <h3 className="section-title">🎯 Learning Objectives</h3>
              <ul className="constraints-list">
                {lesson.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            {lesson.examples.length > 0 && (
              <div className="lesson-section">
                <h3 className="section-title">📝 Examples</h3>
                {lesson.examples.map((example, index) => (
                  <div key={index} className="example-box">
                    <div className="example-title">{example.title}</div>
                    <div className="code-snippet">{example.code}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="lesson-section">
              <h3 className="section-title">⚔️ Constraints & Guidelines</h3>
              <ul className="constraints-list">
                {lesson.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="lesson-right-panel">
          <div className="editor-header">
            <div className="editor-tabs">
              <div 
                className={`editor-tab ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <i className="fas fa-code"></i> Solution.py
              </div>
              <div 
                className={`editor-tab ${activeTab === 'solution' ? 'active' : ''}`}
                onClick={() => setActiveTab('solution')}
              >
                <i className="fas fa-lightbulb"></i> Hint
              </div>
            </div>
            <div className="editor-actions">
              <button className="run-btn" onClick={runCode} disabled={isRunning}>
                <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button className="submit-btn" onClick={submitCode}>
                <i className="fas fa-check"></i> Submit
              </button>
              <button className="reset-btn" onClick={resetCode}>
                <i className="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>

          <div className="editor-content">
            {activeTab === 'code' ? (
              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your Python code here..."
                spellCheck={false}
              />
            ) : (
              <div className="code-editor" style={{ padding: '20px', overflow: 'auto' }}>
                <h3 style={{ color: 'var(--text-gold)', marginBottom: '15px' }}>💡 Solution Hint:</h3>
                <pre className="code-snippet" style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                  {lesson.solution}
                </pre>
              </div>
            )}
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