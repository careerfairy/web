# CareerFairy Mobile App

This is a React Native app built using Expo. Follow the steps below to get started and run the app on your device or a simulator.

## Setup Instructions

### 1. Install Dependencies

First, install the required dependencies using npm inside mobile (apps/mobile) folder:

```bash
npm install
```

### 2. Setup of base url and search criteria

For setup of base webview url, go to .env file and change the data. For any new variable added, please add the type inside .env.d.ts file.
When testing on branch and created a PR, use the PR preview url that should be in patter: https://.[PR-name].careerfairy.io

Go to this link to see how to get current preview url: https://github.com/careerfairy/web/pull/1340

### 3. Running the App

You have two options to run the app, either from the project root or from the \`mobile\` folder.

#### Option 1: From the Project Root

Run the following command from the root of your project for development environment (Webview with localhost:3000):

```bash
npm run native
```

#### Option 2: From the \`mobile\` Folder

Navigate to the mobile folder and then start the app:

```bash
cd apps/mobile
npm run start
```

### 4. QR Code Launch

After running the app, a QR code will be displayed in your terminal.

### 4. Install Expo Go on Your Phone

-  Download and install **Expo Go** from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (for Android) or the [Apple App Store](https://apps.apple.com/us/app/expo-go/id982107779) (for iPhone).

### 5. Scan the QR Code

-  Open **Expo Go** on your phone.
-  Use the app to scan the QR code displayed in the terminal, and the app will launch on your device.

## Running on Simulators

If you'd like to run the app on a simulator instead of a physical device, follow the instructions below.

### For Android Simulator

1. Install and configure [Android Studio](https://developer.android.com/studio).
2. Run the initial command (\`npm run native\` or \`npm run start\`).
3. Press \`a\` in the terminal to launch the Android simulator.

### For iPhone Simulator

1. Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835) and set up the Xcode simulator.
2. Run the initial command (\`npm run native\` or \`npm run start\`).
3. Press \`i\` in the terminal to launch the iPhone simulator.

---

Happy coding! 🎉
