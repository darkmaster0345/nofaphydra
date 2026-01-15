import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nofapfursan.app',
  appName: 'Fursan',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;