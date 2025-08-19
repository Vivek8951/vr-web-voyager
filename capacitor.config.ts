import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.53756256e4a64c0abf2b1a822d862382',
  appName: 'vr-web-voyager',
  webDir: 'dist',
  server: {
    url: 'https://53756256-e4a6-4c0a-bf2b-1a822d862382.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;