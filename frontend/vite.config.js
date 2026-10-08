import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ server: { proxy: { '/api': 'http://localhost:5000', '/socket.io': { target: 'http://localhost:5000', ws: true } } },
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: {
  name: 'Unknown Coaching Centre', short_name: 'UCC', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#4f46e5',
  icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] } })] });
