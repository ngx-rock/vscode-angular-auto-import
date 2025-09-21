#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * SonarQube сканер с поддержкой .env файлов
 * Загружает конфигурацию из .env и запускает sonar-scanner
 */

// Загрузка переменных из .env файла
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Файл .env не найден!');
    console.log('💡 Создайте файл .env с переменными:');
    console.log('   SONAR_TOKEN=your_token');
    console.log('   SONAR_HOST_URL=http://localhost:9000');
    console.log('   SONAR_PROJECT_KEY=your_project_key');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Проверка наличия coverage/lcov.info
function checkCoverage() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'lcov.info');

  if (!fs.existsSync(coveragePath)) {
    console.warn('⚠️  Файл coverage/lcov.info не найден!');
    console.log('💡 Запустите: pnpm run coverage:generate');
    return false;
  }

  const stats = fs.statSync(coveragePath);
  console.log(`📁 Файл покрытия: ${(stats.size / 1024).toFixed(1)} KB`);
  return true;
}

// Главная функция
function main() {
  console.log('🔧 Загрузка конфигурации SonarQube...');

  const env = loadEnv();

  // Проверка обязательных переменных
  const required = ['SONAR_TOKEN', 'SONAR_HOST_URL'];
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    console.error(`❌ Отсутствуют переменные в .env: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`🎯 Проект: ${env.SONAR_PROJECT_KEY || 'из sonar-project.properties'}`);
  console.log(`🌐 Сервер: ${env.SONAR_HOST_URL}`);

  // Проверка покрытия
  checkCoverage();

  // Формирование команды sonar-scanner
  // Большинство настроек берётся из sonar-project.properties
  const sonarCmd = [
    'sonar-scanner',
    `-Dsonar.host.url=${env.SONAR_HOST_URL}`,
    `-Dsonar.token=${env.SONAR_TOKEN}`
  ].join(' ');

  console.log('🚀 Запуск SonarQube анализа...');
  console.log(`📝 Команда: ${sonarCmd.replace(env.SONAR_TOKEN, '***')}`);

  try {
    execSync(sonarCmd, {
      stdio: 'inherit',
      env: { ...process.env, ...env }
    });

    console.log('✅ Анализ SonarQube завершён успешно!');
    const projectKey = env.SONAR_PROJECT_KEY || 'angular-auto-import'; // fallback из sonar-project.properties
    console.log(`🔗 Результаты: ${env.SONAR_HOST_URL}/dashboard?id=${projectKey}`);
  } catch (error) {
    console.error('❌ Ошибка при выполнении SonarQube анализа:');
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadEnv, checkCoverage };
