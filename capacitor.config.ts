import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.honkiroku.app',
  appName: 'ホンキ録',
  webDir: 'out',
  // bundledWebRuntime is omitted for compatibility with the Capacitor types
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
    },
  },
  server: {
    url: '',
    cleartext: true,
  },
};

export default config;
