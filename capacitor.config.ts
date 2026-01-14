import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nofaphydra.app',
  appName: 'NoFap Hydra',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;