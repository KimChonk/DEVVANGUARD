import React, { useState, useEffect } from 'react';
import '../assets/CSS/testcasebuilder.css';

/**
 * TestCaseBuilder Component
 * Allows admins to easily create and manage test cases without writing JSON
 */
export default function TestCaseBuilder({ value = "[]", onChange = null }) {
  const [testCases, setTestCases] = useState([]);

  // Parse JSON string to array on mount/change
  useEffect(() => {
    try {
      if (typeof value === 'string' && value.trim()) {
        const parsed = JSON.parse(value);
        setTestCases(Array.isArray(parsed) ? parsed : []);
      } else {
        setTestCases([]);
      }
    } catch (err) {
      console.error('Failed to parse test cases:', err);
      setTestCases([]);
    }
  }, [value]);

  // Update parent component with JSON string
  const updateParent = (newCases) => {
    setTestCases(newCases);
    if (onChange) {
      onChange(JSON.stringify(newCases, null, 2));
    }
  };

  // Add new test case
  const addTestCase = () => {
    const newTestCase = {
      name: `Test Case ${testCases.length + 1}`,
      input: '',
      expected: '',
      hidden: false,
    };
    updateParent([...testCases, newTestCase]);
  };

  // Update test case field
  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateParent(updated);
  };

  // Delete test case
  const deleteTestCase = (index) => {
    const updated = testCases.filter((_, i) => i !== index);
    updateParent(updated);
  };

  // Toggle hidden flag
  const toggleHidden = (index) => {
    const updated = [...testCases];
    updated[index].hidden = !updated[index].hidden;
    updateParent(updated);
  };

  return (
    <div className="test-case-builder">
      <div className="test-case-header">
        <label className="test-case-title">Test Cases Manager</label>
        <button
          className="test-case-add-btn"
          onClick={addTestCase}
          type="button"
        >
          + Add Test Case
        </button>
      </div>

      {testCases.length === 0 ? (
        <div className="test-case-empty">
          <p>No test cases yet. Click "Add Test Case" to create one.</p>
        </div>
      ) : (
        <div className="test-case-table-container">
          <table className="test-case-table">
            <thead>
              <tr>
                <th className="col-name">Test Case Name</th>
                <th className="col-input">Input (use \n for line breaks)</th>
                <th className="col-expected">Expected Output</th>
                <th className="col-hidden">Hidden</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase, index) => (
                <tr key={index} className={`test-case-row ${testCase.hidden ? 'hidden' : 'public'}`}>
                  <td className="col-name">
                    <input
                      type="text"
                      className="test-case-input"
                      value={testCase.name || ''}
                      onChange={(e) =>
                        updateTestCase(index, 'name', e.target.value)
                      }
                      placeholder="E.g., Test Case 1 (Public)"
                    />
                  </td>
                  <td className="col-input">
                    <textarea
                      className="test-case-textarea"
                      value={testCase.input || ''}
                      onChange={(e) =>
                        updateTestCase(index, 'input', e.target.value)
                      }
                      placeholder="5\n10"
                      rows="2"
                    />
                  </td>
                  <td className="col-expected">
                    <input
                      type="text"
                      className="test-case-input"
                      value={testCase.expected || ''}
                      onChange={(e) =>
                        updateTestCase(index, 'expected', e.target.value)
                      }
                      placeholder="15"
                    />
                  </td>
                  <td className="col-hidden">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        className="test-case-checkbox"
                        checked={testCase.hidden || false}
                        onChange={() => toggleHidden(index)}
                      />
                      <span className="checkbox-text">
                        {testCase.hidden ? 'Hidden' : 'Public'}
                      </span>
                    </label>
                  </td>
                  <td className="col-action">
                    <button
                      className="test-case-delete-btn"
                      onClick={() => deleteTestCase(index)}
                      type="button"
                      title="Delete this test case"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {testCases.length > 0 && (
        <div className="test-case-preview">
          <label className="preview-label">JSON Preview:</label>
          <pre className="preview-code">
            {JSON.stringify(testCases, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
