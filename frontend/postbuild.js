import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('postbuild: dist/index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf-8');

// 1. Create 404.html for static servers that fallback on 404
fs.writeFileSync(path.join(distDir, '404.html'), indexContent);

// 2. Pre-generate physical route folders and index.html so static web servers serve 200 OK
const routes = [
  'verify-payment',
  'search',
  'checkout',
  'checkout/chapa-sandbox',
  'routes',
  'how-it-works',
  'help',
  'my-tickets',
  'my-bookings',
  'my-trips',
  'passenger',
  'profile',
  'login',
  'register',
  'tickets',
];

routes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent);

  if (!route.includes('/')) {
    fs.writeFileSync(path.join(distDir, `${route}.html`), indexContent);
  }
});

// 3. Fallback redirects file for platforms supporting _redirects
fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200\n');

console.log('postbuild: Generated static route directories & 404.html fallback successfully.');
