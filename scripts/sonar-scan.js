#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * SonarQube scanner script with .env file support.
 * This script loads configuration from a .env file and runs the sonar-scanner.
 */

/**
 * Loads environment variables from a .env file in the project root.
 * @returns {Record<string, string>} A dictionary of environment variables.
 */
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found!");
    console.log("💡 Create a .env file with the following variables:");
    console.log("   SONAR_TOKEN=your_token");
    console.log("   SONAR_HOST_URL=http://localhost:9000");
    console.log("   SONAR_PROJECT_KEY=your_project_key (optional)");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return envVars;
}

/**
 * Reads the project key from the sonar-project.properties file.
 * @returns {string | null} The SonarQube project key, or null if not found.
 */
function getProjectKeyFromProperties() {
  const propertiesPath = path.join(process.cwd(), "sonar-project.properties");
  if (!fs.existsSync(propertiesPath)) {
    return null;
  }

  const propertiesContent = fs.readFileSync(propertiesPath, "utf8");
  const match = propertiesContent.match(/^sonar\.projectKey=(.*)$/m);

  return match ? match[1].trim() : null;
}

/**
 * Checks for the existence of the lcov.info coverage file.
 * @returns {boolean} True if the file exists, false otherwise.
 */
function checkCoverage() {
  const coveragePath = path.join(process.cwd(), "coverage", "lcov.info");

  if (!fs.existsSync(coveragePath)) {
    console.warn("⚠️  coverage/lcov.info file not found!");
    console.log("💡 Run: pnpm run coverage:generate");
    return false;
  }

  const stats = fs.statSync(coveragePath);
  console.log(`📁 Coverage file found: ${(stats.size / 1024).toFixed(1)} KB`);
  return true;
}

/**
 * Main function to run the SonarQube scanner.
 */
function main() {
  console.log("🔧 Loading SonarQube configuration...");

  const env = loadEnv();

  // Check for required environment variables
  const required = ["SONAR_TOKEN", "SONAR_HOST_URL"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing variables in .env file: ${missing.join(", ")}`);
    process.exit(1);
  }

  const projectKey = env.SONAR_PROJECT_KEY || getProjectKeyFromProperties();
  if (!projectKey) {
    console.error("❌ SONAR_PROJECT_KEY not found in .env or sonar-project.properties");
    process.exit(1);
  }

  console.log(`🎯 Project: ${projectKey}`);
  console.log(`🌐 Server: ${env.SONAR_HOST_URL}`);

  // Check for coverage file
  checkCoverage();

  // Construct the sonar-scanner command
  // Most settings are taken from sonar-project.properties
  const sonarCmd = [
    "sonar-scanner",
    `-Dsonar.host.url=${env.SONAR_HOST_URL}`,
    `-Dsonar.token=${env.SONAR_TOKEN}`,
    `-Dsonar.projectKey=${projectKey}`,
  ].join(" ");

  console.log("🚀 Starting SonarQube analysis...");
  console.log(`📝 Command: ${sonarCmd.replace(env.SONAR_TOKEN, "***")}`);

  try {
    execSync(sonarCmd, {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });

    console.log("✅ SonarQube analysis finished successfully!");
    console.log(`🔗 Results: ${env.SONAR_HOST_URL}/dashboard?id=${projectKey}`);
  } catch (error) {
    console.error("❌ Error during SonarQube analysis:");
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadEnv, checkCoverage, getProjectKeyFromProperties };
