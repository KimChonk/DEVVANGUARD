/**
 * PvP-specific Piston Compiler Service
 * Optimized for PvP battles with multiple programming languages
 * Fixes 400 Bad Request errors by properly formatting requests
 */

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Language versions - verified working with Piston API
const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  java: "15.0.2",
  c: "10.2.0",
  cpp: "10.2.0",
};

// Language mapping
const LANGUAGE_MAP = {
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
};

// Default code templates for each language
export const CODE_TEMPLATES = {
  python: `# Python Template
def solve():
    #Enter your code here

if __name__ == "__main__":
    solve()
`,
  java: `
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        // Your code here




    }
}
`,
  c: `
#include <stdio.h>

int main() {   
    // Your code here







    return 0;
}
`,
  cpp: `
#include <iostream>
using namespace std;

int main() {
    // Your code here




    
    return 0;
}
`,
};

/**
 * Execute code with Piston API - PvP optimized
 * @param {string} language - Language (python, java, c, cpp)
 * @param {string} code - Code to execute
 * @param {string} input - Input to stdin
 * @returns {Promise} Execution result
 */
export async function executePvPCode(language, code, input = "") {
  try {
    if (!language || !code) {
      return {
        success: false,
        stdout: "",
        stderr: "Language and code are required",
        output: "Error: Language and code are required",
      };
    }

    const pistonLang = LANGUAGE_MAP[language] || language;
    const version = LANGUAGE_VERSIONS[language] || "*";

    // Prepare payload - IMPORTANT: Keep structure simple
    const payload = {
      language: pistonLang,
      version: version,
      files: [
        {
          content: code,
        },
      ],
      stdin: input || "",
      run_timeout: 10000,
    };

    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PvP Compiler] API Error: ${response.status}`, errorText);
      
      // Handle common errors
      if (response.status === 400) {
        return {
          success: false,
          stdout: "",
          stderr: "Bad Request - Invalid code or input format",
          output: "Error: Invalid code format. Check syntax.",
          statusCode: 400,
        };
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Extract output - Piston uses result.run.stdout/stderr
    const stdout = result.run?.stdout || "";
    const stderr = result.run?.stderr || "";
    const exitCode = result.run?.code || 0;

    if (stderr && exitCode !== 0) {
      console.warn(`[PvP Compiler] Execution error (exit code ${exitCode}):`, stderr);
      return {
        success: false,
        stdout: stdout,
        stderr: stderr,
        output: stderr,
        exitCode: exitCode,
      };
    }

    return {
      success: true,
      stdout: stdout,
      stderr: stderr,
      output: stdout || "(No output)",
      exitCode: 0,
    };
  } catch (error) {
    console.error(`[PvP Compiler] Exception:`, error.message);
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      output: `Error: ${error.message}`,
      exitCode: 1,
    };
  }
}

/**
 * Validate single test case
 * @param {string} actualOutput - Output from code
 * @param {string} expectedOutput - Expected output
 * @returns {boolean} Test passed?
 */
function validateTestOutput(actualOutput, expectedOutput) {
  const actual = actualOutput.trim();
  const expected = expectedOutput.trim();

  // Exact match
  if (actual === expected) return true;

  // Normalize whitespace
  if (actual.replace(/\s+/g, " ") === expected.replace(/\s+/g, " ")) return true;

  // Line by line
  const actualLines = actual.split("\n").map((l) => l.trim()).filter((l) => l);
  const expectedLines = expected.split("\n").map((l) => l.trim()).filter((l) => l);

  if (actualLines.length === expectedLines.length) {
    return actualLines.every((line, idx) => line === expectedLines[idx]);
  }

  return false;
}

/**
 * Execute and validate all test cases
 * @param {string} language - Language
 * @param {string} code - Code to test
 * @param {Array} testCases - Array of {input, expected_output, name}
 * @returns {Promise} Validation result
 */
export async function executePvPAndValidate(language, code, testCases = []) {
  if (!testCases || testCases.length === 0) {
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: 0,
      results: [],
      output: "No test cases provided",
      detailedResults: "No test cases to run",
    };
  }

  const results = [];
  let passedCount = 0;

  // Execute each test case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const input = testCase.input || testCase.input_value || "";
    const expectedOutput = testCase.expected_output || testCase.expected || "";
    const testName = testCase.name || `Test ${i + 1}`;

    const execution = await executePvPCode(language, code, input);

    if (!execution.success) {
      console.warn(`[PvP Compiler] ${testName} failed to execute:`, execution.stderr);
      results.push({
        testNumber: i + 1,
        testName: testName,
        input: input,
        expected: expectedOutput,
        actual: "(Execution error)",
        passed: false,
        error: execution.stderr,
      });
      continue;
    }

    const passed = validateTestOutput(execution.stdout, expectedOutput);
    if (passed) passedCount++;

    results.push({
      testNumber: i + 1,
      testName: testName,
      input: input,
      expected: expectedOutput.trim(),
      actual: execution.stdout.trim() || "(No output)",
      passed: passed,
    });
  }

  const allPassed = passedCount === testCases.length;

  // Format detailed results
  let detailedResults = `Test Results: ${passedCount}/${testCases.length} passed\n\n`;
  results.forEach((result) => {
    const status = result.passed ? "PASS" : "FAIL";
    detailedResults += `[${status}] ${result.testName}\n`;

    if (!result.passed) {
      detailedResults += `  Input: ${result.input || "(empty)"}\n`;
      detailedResults += `  Expected: ${result.expected}\n`;
      detailedResults += `  Actual: ${result.actual}\n`;
      if (result.error) {
        detailedResults += `  Error: ${result.error}\n`;
      }
    }
    detailedResults += "\n";
  });

  return {
    allPassed: allPassed,
    passedCount: passedCount,
    totalCount: testCases.length,
    results: results,
    output: detailedResults,
    detailedResults: detailedResults,
  };
}

/**
 * Get code template for language
 */
export function getCodeTemplate(language) {
  return CODE_TEMPLATES[language] || CODE_TEMPLATES.python;
}
