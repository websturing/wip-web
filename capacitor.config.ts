import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wip.apps',
  appName: 'WIP Apps',
  webDir: 'out',
  server: {
    url: 'http://172.18.78.66:3000',
    cleartext: true
  }
};


export default config;
