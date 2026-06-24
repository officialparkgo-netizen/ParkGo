/**
 * Capacitor configuration (web-first → iOS/Android wrappers).
 *
 * Strategy: build a static export of the web app and wrap it with Capacitor.
 *   1. npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/ios @capacitor/android
 *   2. BUILD_TARGET=capacitor npm run build      # emits ./out (static export)
 *   3. npx cap add ios && npx cap add android
 *   4. npx cap sync && npx cap open ios|android
 *
 * For server features (auth, live data) in the shipped app, either point
 * `server.url` at the deployed site or call the API over HTTPS from the shell.
 * Permission usage strings (location, camera, notifications) are added in the
 * native projects per the App Store privacy manifest / Play Data safety form.
 *
 * Typed as `import('@capacitor/cli').CapacitorConfig` once Capacitor is installed.
 */
const config = {
  appId: "com.parkgo.app",
  appName: "ParkGo",
  webDir: "out",
  backgroundColor: "#0E2A47",
  plugins: {
    SplashScreen: { backgroundColor: "#0E2A47", showSpinner: false },
  },
  // server: { url: "https://app.parkgo.example", cleartext: false },
};

export default config;
