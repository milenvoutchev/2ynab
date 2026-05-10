const fs = require('fs');
const path = require('path');

/**
 * Parse INI-style config file and return section config
 * @param {string} filePath - Path to config file
 * @param {string} section - Section name to extract
 * @returns {object} Configuration key-value pairs
 */
function loadConfig(filePath, section) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const config = {};
  let currentSection = null;

  lines.forEach(line => {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    // Check for section header [SECTION_NAME]
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      return;
    }

    // Parse key = value pairs only in matching section
    if (currentSection === section) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > -1) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        config[key] = value;
      }
    }
  });

  return config;
}

/**
 * Get bank config by section name (from bank2ynab - third-party)
 * @param {string} section - Bank section name
 * @returns {object} Bank configuration
 */
function getBankConfig(section) {
  const configPath = path.join(__dirname, '../../config/bank2ynab/bank2ynab.conf');
  return loadConfig(configPath, section);
}

/**
 * Get project config by section name (from 2ynab.conf - project-specific)
 * @param {string} section - Section name
 * @returns {object} Configuration
 */
function getProjectConfig(section) {
  const configPath = path.join(__dirname, '../../config/2ynab.conf');
  return loadConfig(configPath, section);
}

/**
 * Load CSV parsing settings from a config section
 * Handles both CSV column names and YNAB field names (Date, Payee, Inflow, etc.)
 *
 * @param {string} section - Config section name
 * @param {function} configFn - Config loader function (defaults to getProjectConfig for 2ynab.conf, or getBankConfig for bank2ynab.conf)
 * @returns {{ delimiter, headerRows, sliceEnd, columns, filenamePattern, skip_empty_lines, skip_lines_with_empty_values, dateFormat?, rowFilter? }}
 */
function loadCsvConfig(section, configFn = getProjectConfig) {
  const config = configFn(section);
  const headerRows = parseInt(config['Header Rows'] || 1, 10);
  const footerRows = parseInt(config['Footer Rows'] || 0, 10);
  const inputColumnsStr = config['Input Columns'] || '';
  const dateFormat = config['Date Format'] || '';

  // Parse input columns - can contain field names and "skip" markers
  const inputColumns = inputColumnsStr ? inputColumnsStr.split(',').map(c => c.trim()) : [];

  // Filter out "skip" entries to create valid column names
  const columns = inputColumns.map((col, idx) => col === 'skip' ? undefined : col);

  const result = {
    delimiter: config['Source CSV Delimiter'] || ',',
    headerRows,
    sliceEnd: footerRows > 0 ? -footerRows : Infinity,
    columns,
    filenamePattern: config['Source Filename Pattern'] || '',
    skip_empty_lines: true,
    skip_lines_with_empty_values: true,
  };

  // Add optional date format if specified
  if (dateFormat) {
    result.dateFormat = dateFormat;
  }

  return result;
}

module.exports = { loadConfig, getBankConfig, getProjectConfig, loadCsvConfig };
