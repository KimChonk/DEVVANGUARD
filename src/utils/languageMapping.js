/**
 * Map database language names to editor/compiler language IDs
 */

// Map from Database (uppercase) to Monaco Editor (lowercase)
export const dbToEditorLanguage = {
  'PYTHON': 'python',
  'JAVA': 'java',
  'C++': 'cpp',
  'CPP': 'cpp',
  'C': 'c',
  'JAVASCRIPT': 'javascript',
  'TYPESCRIPT': 'typescript',
};

// Map from Database (uppercase) to Piston API language IDs
export const dbToPistonLanguage = {
  'PYTHON': 'python',
  'JAVA': 'java',
  'C++': 'cpp',
  'CPP': 'cpp',
  'C': 'c',
  'JAVASCRIPT': 'javascript',
  'TYPESCRIPT': 'typescript',
};

/**
 * Convert database language name to editor language ID
 * @param {string} dbLanguage - Language from database (e.g., "PYTHON", "JAVA", "C++")
 * @returns {string} Editor language ID (e.g., "python", "java", "cpp")
 */
export function convertDbToEditorLanguage(dbLanguage) {
  if (!dbLanguage) return 'python'; // default
  return dbToEditorLanguage[dbLanguage.toUpperCase()] || dbLanguage.toLowerCase();
}

/**
 * Convert database language name to Piston API language ID
 * @param {string} dbLanguage - Language from database (e.g., "PYTHON", "JAVA", "C++")
 * @returns {string} Piston API language ID (e.g., "python", "java", "cpp")
 */
export function convertDbToPistonLanguage(dbLanguage) {
  if (!dbLanguage) return 'python'; // default
  return dbToPistonLanguage[dbLanguage.toUpperCase()] || dbLanguage.toLowerCase();
}

/**
 * Get display name for language
 * @param {string} dbLanguage - Language from database
 * @returns {string} Display name (e.g., "Python 3.10", "Java 15.0.1", "C++ 11")
 */
export function getLanguageDisplayName(dbLanguage) {
  if (!dbLanguage) return 'Python 3.10';
  
  const upper = dbLanguage.toUpperCase();
  const versions = {
    'PYTHON': 'Python 3.10',
    'JAVA': 'Java 15.0.1',
    'C++': 'C++ 11',
    'CPP': 'C++ 11',
    'C': 'C 11',
    'JAVASCRIPT': 'Node.js 18.16.0',
    'TYPESCRIPT': 'TypeScript 5.0',
  };
  
  return versions[upper] || `${dbLanguage} (Unknown)`;
}

export default {
  dbToEditorLanguage,
  dbToPistonLanguage,
  convertDbToEditorLanguage,
  convertDbToPistonLanguage,
  getLanguageDisplayName,
};
