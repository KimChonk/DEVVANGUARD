/**
 * Practice Piston Compiler Service
 * Similar to PvP compiler but adapted for practice mode
 */

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  java: "15.0.2",
  c: "10.2.0",
  cpp: "10.2.0",
};

const LANGUAGE_MAP = {
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export const CODE_TEMPLATES = {
  python: `
def solve():
    # Enter your code here

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
 * Execute code with Piston API - Practice optimized
 */
export async function executePracticeCode(language, code, input = "") {
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
      console.error(`[Practice Compiler] API Error: ${response.status}`, errorText);
      
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

    const stdout = result.run?.stdout || "";
    const stderr = result.run?.stderr || "";
    const exitCode = result.run?.code || 0;

    if (stderr && exitCode !== 0) {
      console.warn(`[Practice Compiler] Execution error (exit code ${exitCode}):`, stderr);
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
    console.error(`[Practice Compiler] Exception:`, error.message);
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
 * Validate single test case output
 */
function validateTestOutput(actualOutput, expectedOutput) {
  const actual = actualOutput.trim();
  const expected = expectedOutput.trim();

  if (actual === expected) return true;

  if (actual.replace(/\s+/g, " ") === expected.replace(/\s+/g, " ")) return true;

  const actualLines = actual.split("\n").map((l) => l.trim()).filter((l) => l);
  const expectedLines = expected.split("\n").map((l) => l.trim()).filter((l) => l);

  if (actualLines.length === expectedLines.length) {
    return actualLines.every((line, idx) => line === expectedLines[idx]);
  }

  return false;
}

/**
 * Execute and validate all test cases
 */
export async function executePracticeAndValidate(language, code, testCases) {
  try {
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return {
        allPassed: false,
        results: [],
        output: "No test cases available",
      };
    }

    const results = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = testCase.input || "";
      const expectedOutput = testCase.expected || testCase.expectedOutput || testCase.output || "";

      const result = await executePracticeCode(language, code, input);

      const passed = validateTestOutput(result.output, expectedOutput);
      allPassed = allPassed && passed;

      results.push({
        testNumber: i + 1,
        input: input,
        expectedOutput: expectedOutput,
        actualOutput: result.output,
        passed: passed,
        error: result.stderr || null,
      });
    }

    return {
      allPassed: allPassed,
      results: results,
      output: results.map((r) => `Test ${r.testNumber}: ${r.passed ? "PASSED" : "FAILED"}`).join("\n"),
    };
  } catch (error) {
    console.error("[Practice Compiler] Validation error:", error);
    return {
      allPassed: false,
      results: [],
      output: `Error: ${error.message}`,
    };
  }
}

/**
 * Get code template for language
 */
export function getCodeTemplate(language) {
  return CODE_TEMPLATES[language] || CODE_TEMPLATES.python;
}
