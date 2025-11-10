// Piston Compiler API Service
// Integrates with https://emkc.org/api/v2/piston/execute

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Language configuration
export const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  javascript: "18.13.0",
  java: "15.0.2",
  c: "10.2.0",
  cpp: "10.2.0",
  csharp: "11.0.0",
  go: "1.20.0",
  rust: "1.70.0",
};

// Simplified language names for Piston API
const LANGUAGE_MAP = {
  python: "python",
  javascript: "javascript",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust",
};

/**
 * Execute code using Piston API
 * @param {string} language - Programming language (e.g., "python", "java", "cpp")
 * @param {string} code - Code to execute
 * @param {string} input - Optional input to stdin
 * @returns {Promise} Object with { stdout, stderr, exitCode, executionTime }
 */
export async function executeCode(language, code, input = "") {
  try {
    if (!language) {
      throw new Error("Language parameter is required for code execution");
    }
    
    console.log(` Executing ${language} code via Piston API...`);
    const startTime = performance.now();

    const pistonLang = LANGUAGE_MAP[language] || language;
    const version = LANGUAGE_VERSIONS[language] || "*";
    
    console.log(`   Language Mapping: ${language} → ${pistonLang} v${version}`);

    const payload = {
      language: pistonLang,
      version: version,
      files: [
        {
          content: code,
        },
      ],
      stdin: input,
      run_timeout: 10000, // 10 seconds timeout
    };

    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);

    console.log("Piston API Response:", result);

    // Extract output from result
    const stdout = result.run?.stdout || "";
    const stderr = result.run?.stderr || "";
    const exitCode = result.run?.code || 0;

    if (stderr) {
      console.error("Stderr:", stderr);
      return {
        success: false,
        stdout: stdout,
        stderr: stderr,
        exitCode: exitCode,
        output: stderr,
        executionTime: executionTime,
      };
    }

    return {
      success: true,
      stdout: stdout,
      stderr: stderr,
      exitCode: exitCode,
      output: stdout || "(No output)",
      executionTime: executionTime,
    };
  } catch (error) {
    console.error("Piston API Error:", error);
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: 1,
      output: `Error: ${error.message}`,
      executionTime: 0,
    };
  }
}

/**
 * Parse output and compare with expected values
 * Supports multiple test cases with different output formats
 *
 * @param {string} actualOutput - Output from code execution
 * @param {Array} testCases - Array of test case objects
 * @returns {Object} { passed, total, results: [{testId, name, passed, expected, actual}] }
 */
export function validateTestCases(actualOutput, testCases) {
  if (!testCases || testCases.length === 0) {
    return {
      passed: 0,
      total: 0,
      results: [],
    };
  }

  // Filter only public test cases (hidden: false or not hidden)
  const publicTests = testCases.filter(tc => !tc.hidden);

  // Split output by lines
  const outputLines = actualOutput
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let passedCount = 0;
  const results = [];

  publicTests.forEach((testCase, index) => {
    // Support multiple field names for expected output
    const expected =
      testCase.expected ||
      testCase.expected_output ||
      testCase.expectedOutput ||
      testCase.output ||
      "";

    // Try to match output
    let passed = false;
    let actualMatch = "";

    // Strategy 1: Direct line match
    if (outputLines[index]?.trim() === expected.trim()) {
      passed = true;
      actualMatch = outputLines[index];
    }

    // Strategy 2: Contains check
    if (!passed && actualOutput.includes(expected)) {
      passed = true;
      actualMatch = expected;
    }

    // Strategy 3: Normalize whitespace and compare
    if (
      !passed &&
      actualOutput.replace(/\s+/g, " ").includes(expected.replace(/\s+/g, " "))
    ) {
      passed = true;
      actualMatch = expected;
    }

    if (passed) passedCount++;

    results.push({
      id: testCase.id || index + 1,
      name: testCase.name || `Test ${index + 1}`,
      description: testCase.description || "",
      expected: expected,
      actual: actualMatch || (outputLines[index] || "(No output)"),
      passed: passed,
    });
  });

  return {
    passed: passedCount,
    total: publicTests.length,
    results: results,
  };
}

/**
 * Format test results for display
 *
 * @param {Object} validationResult - Result from validateTestCases
 * @returns {string} Formatted string for display
 */
export function formatTestResults(validationResult) {
  const { passed, total, results } = validationResult;

  let output = `\nTest Results: ${passed}/${total} passed\n`;

  results.forEach((result) => {
    const status = result.passed ? "PASS" : "FAIL";
    output += `${status}: ${result.name}\n`;

    if (!result.passed) {
      output += `  Expected: ${result.expected}\n`;
      output += `  Actual:   ${result.actual}\n`;
    }
  });

  return output;
}

/**
 * Complete test flow: Execute code -> Validate test cases
 *
 * @param {string} language - Programming language (e.g., "python", "java", "cpp")
 * @param {string} code - Code to execute
 * @param {Array} testCases - Array of test cases
 * @returns {Promise} Object with execution and test results
 */
export async function executeAndValidate(language, code, testCases = []) {
  // Validate language parameter
  if (!language) {
    return {
      execution: { success: false, stdout: "", stderr: "Language parameter is required" },
      validation: { passed: 0, total: 0, results: [] },
      passed: false,
      message: " Error: Language parameter is required",
      output: "Error: Language parameter is required",
      formattedResults: "",
    };
  }
  
  // Filter only public test cases
  const publicTests = testCases.filter(tc => !tc.hidden);

  if (publicTests.length === 0) {
    // No test cases to run
    const execution = await executeCode(language, code);
    return {
      execution,
      validation: { passed: 0, total: 0, results: [] },
      passed: false,
      message: "No public test cases to run",
    };
  }

  // Execute each test case individually and collect results
  const results = [];
  let passedCount = 0;
  let allOutputs = "";

  for (let i = 0; i < publicTests.length; i++) {
    const testCase = publicTests[i];
    const input = testCase.input || "";
    
    // Execute code with this specific test input
    const execution = await executeCode(language, code, input);
    
    if (!execution.success) {
      console.error(`Test ${i + 1} execution failed:`, execution.stderr);
      results.push({
        id: testCase.id || i + 1,
        name: testCase.name || `Test ${i + 1}`,
        description: testCase.description || "",
        expected: testCase.expected || testCase.expected_output || testCase.output || "",
        actual: `(No output)`,
        passed: false,
        error: execution.stderr,
      });
      continue;
    }

    // Get expected output (support multiple field names)
    const expected =
      testCase.expected ||
      testCase.expected_output ||
      testCase.expectedOutput ||
      testCase.output ||
      "";

    // Trim and compare outputs
    const actualOutput = execution.stdout.trim();
    const expectedOutput = expected.trim();
    
    // Multiple comparison strategies
    let passed = false;

    // Strategy 1: Exact match
    if (actualOutput === expectedOutput) {
      passed = true;
    }

    // Strategy 2: Normalize whitespace
    if (!passed && actualOutput.replace(/\s+/g, " ") === expectedOutput.replace(/\s+/g, " ")) {
      passed = true;
    }

    // Strategy 3: Line-by-line comparison (for multiple outputs)
    if (!passed) {
      const actualLines = actualOutput.split("\n").map(l => l.trim()).filter(l => l);
      const expectedLines = expectedOutput.split("\n").map(l => l.trim()).filter(l => l);
      if (actualLines.length === expectedLines.length && actualLines.every((line, idx) => line === expectedLines[idx])) {
        passed = true;
      }
    }

    if (passed) passedCount++;

    results.push({
      id: testCase.id || i + 1,
      name: testCase.name || `Test ${i + 1}`,
      description: testCase.description || "",
      expected: expectedOutput,
      actual: actualOutput || "(No output)",
      passed: passed,
    });

    allOutputs += `\n--- Test ${i + 1} ---\n${actualOutput}`;
  }

  const allPassed = passedCount === publicTests.length;

  const validation = {
    passed: passedCount,
    total: publicTests.length,
    results: results,
  };

  return {
    execution: { success: true, stdout: allOutputs, stderr: "" },
    validation,
    passed: allPassed,
    message: allPassed
      ? `All ${publicTests.length} tests passed!`
      : `${publicTests.length - passedCount} test(s) failed`,
    output: allOutputs,
    formattedResults: formatTestResults(validation),
  };
}
