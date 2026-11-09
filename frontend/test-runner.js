/**
 * Frontend Unit & Component Contract Test Runner (ESM)
 * Validates frontend component exports, routing definitions, API contract mappings, and state consistency.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌾 Running Frontend Component & Contract Test Suite...');

const requiredScreens = [
  'LandingPage.jsx',
  'RegisterPage.jsx',
  'LoginPage.jsx',
  'FarmerDashboard.jsx',
  'FarmerProfilePage.jsx',
  'LiveWeatherPage.jsx',
  'ForecastPage.jsx',
  'CropManagementPage.jsx',
  'CropAdvisoryPage.jsx',
  'WeatherAlertsPage.jsx',
  'FarmerQueryPage.jsx',
  'AdminDashboardPage.jsx',
  'ExpertDashboardPage.jsx',
  'ReportsPage.jsx'
];

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Verify all 14 screens exist and have export default
console.log('\n[Suite 1] Mandatory 14 Screen Components Verification:');
requiredScreens.forEach((file) => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Screen component exists: ${file}`);

  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('export default'), `${file} has a valid default export`);
  }
});

// 2. Verify Layout and Core Components
console.log('\n[Suite 2] Layout and Reusable Components Verification:');
const coreComponents = [
  'Navbar.jsx',
  'Sidebar.jsx',
  'Footer.jsx',
  'MetricCard.jsx',
  'WeatherWidget.jsx',
  'Modal.jsx',
  'ExportToolbar.jsx'
];
coreComponents.forEach((file) => {
  const filePath = path.join(__dirname, 'src', 'components', file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Core component exists: ${file}`);
});

// 3. Verify Context Providers & Services
console.log('\n[Suite 3] Context State & API Client Verification:');
assert(fs.existsSync(path.join(__dirname, 'src', 'context', 'AuthContext.jsx')), 'AuthContext.jsx exists');
assert(fs.existsSync(path.join(__dirname, 'src', 'context', 'WeatherContext.jsx')), 'WeatherContext.jsx exists');
assert(fs.existsSync(path.join(__dirname, 'src', 'context', 'ToastContext.jsx')), 'ToastContext.jsx exists');
assert(fs.existsSync(path.join(__dirname, 'src', 'services', 'api.js')), 'API service module exists');

const apiContent = fs.readFileSync(path.join(__dirname, 'src', 'services', 'api.js'), 'utf8');
assert(apiContent.includes('authAPI'), 'authAPI endpoints exported');
assert(apiContent.includes('cropAPI'), 'cropAPI CRUD endpoints exported');
assert(apiContent.includes('weatherAPI'), 'weatherAPI endpoints exported');
assert(apiContent.includes('advisoryAPI'), 'advisoryAPI endpoints exported');
assert(apiContent.includes('alertAPI'), 'alertAPI endpoints exported');
assert(apiContent.includes('queryAPI'), 'queryAPI endpoints exported');
assert(apiContent.includes('reportAPI'), 'reportAPI endpoints exported');
assert(apiContent.includes('adminAPI'), 'adminAPI endpoints exported');

// 4. Verify Route Definitions in App.jsx
console.log('\n[Suite 4] Route Configurations in App.jsx:');
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');
assert(appContent.includes('path="/farmer-dashboard"'), 'Farmer dashboard route mapped');
assert(appContent.includes('path="/profile"'), 'Profile page route mapped');
assert(appContent.includes('path="/live-weather"'), 'Live weather route mapped');
assert(appContent.includes('path="/forecast"'), 'Forecast route mapped');
assert(appContent.includes('path="/crops"'), 'Crop management route mapped');
assert(appContent.includes('path="/advisory"'), 'Crop advisory route mapped');
assert(appContent.includes('path="/alerts"'), 'Weather alerts route mapped');
assert(appContent.includes('path="/queries"'), 'Farmer queries route mapped');
assert(appContent.includes('path="/admin"'), 'Admin dashboard route mapped');
assert(appContent.includes('path="/expert"'), 'Expert dashboard route mapped');
assert(appContent.includes('path="/reports"'), 'Reports route mapped');

console.log(`\n================================================================`);
console.log(`Frontend Test Summary: ${passCount} Passed, ${failCount} Failed`);
console.log(`================================================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
