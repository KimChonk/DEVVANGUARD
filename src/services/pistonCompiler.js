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
 * @param {string} language - Programming language
 * @param {string} code - Code to execute
 * @param {string} input - Optional input to stdin
 * @returns {Promise} Object with { stdout, stderr, exitCode }
 */
export async function executeCode(language, code, input = "") {
  try {
    console.log(`🚀 Executing ${language} code via Piston API...`);

    const pistonLang = LANGUAGE_MAP[language] || language;
    const version = LANGUAGE_VERSIONS[language] || "*";

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

    console.log("✅ Piston API Response:", result);

    // Extract output from result
    const stdout = result.run?.stdout || "";
    const stderr = result.run?.stderr || "";
    const exitCode = result.run?.code || 0;

    if (stderr) {
      console.error("❌ Stderr:", stderr);
      return {
        success: false,
        stdout: stdout,
        stderr: stderr,
        exitCode: exitCode,
        output: stderr,
      };
    }

    return {
      success: true,
      stdout: stdout,
      stderr: stderr,
      exitCode: exitCode,
      output: stdout || "(No output)",
    };
  } catch (error) {
    console.error("❌ Piston API Error:", error);
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: 1,
      output: `Error: ${error.message}`,
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

  // Split output by lines
  const outputLines = actualOutput
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let passedCount = 0;
  const results = [];

  testCases.forEach((testCase, index) => {
    const expected =
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
    total: testCases.length,
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

  let output = `\n📊 Test Results: ${passed}/${total} passed\n`;
  output += "=".repeat(40) + "\n\n";

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    output += `${status}: ${result.name}\n`;

    if (result.description) {
      output += `  Description: ${result.description}\n`;
    }

    output += `  Expected: ${result.expected}\n`;
    output += `  Actual:   ${result.actual}\n`;
    output += "\n";
  });

  return output;
}

/**
 * Complete test flow: Execute code -> Validate test cases
 *
 * @param {string} language - Programming language
 * @param {string} code - Code to execute
 * @param {Array} testCases - Array of test cases
 * @returns {Promise} Object with execution and test results
 */
export async function executeAndValidate(language, code, testCases = []) {
  // Execute code
  const execution = await executeCode(language, code);

  if (!execution.success) {
    return {
      execution,
      validation: { passed: 0, total: 0, results: [] },
      passed: false,
      message: `Execution Error: ${execution.stderr}`,
    };
  }

  // Validate test cases
  const validation = validateTestCases(execution.stdout, testCases);

  const allPassed = validation.passed === validation.total;

  return {
    execution,
    validation,
    passed: allPassed,
    message: allPassed
      ? `🎉 All ${validation.total} tests passed!`
      : `❌ ${validation.total - validation.passed} test(s) failed`,
    output: execution.stdout,
    formattedResults: formatTestResults(validation),
  };
}
