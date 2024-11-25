# CareerFairy Mobile App

This is a React Native app built using Expo. Follow the steps below to get started and run the app on your device or a simulator.

## Setup Instructions

### 1. Install Dependencies

First, install the required dependencies using npm inside mobile (apps/mobile) folder:

```bash
npm install
```

### 2. Setup of base url and search criteria

For setup of base webview url, go to .env file and change the data. For any new variable added to the file (or removed), please update the types in .env.d.ts file.
When testing on branch and created a PR, use the PR preview url that should be in pattern: https://pr-[pr-number].preview.careerfairy.io

Go to this link to see how to get current preview url: https://github.com/careerfairy/web/pull/1340
If you change base url, please go to apps/mobile and run command:

```bash
expo start -c
```

or

```bash
npm run native:cache
```

from the root of the project.

It will remove cache and update environment. Also, before launching a build, start the script once again when you want the build to use that url and after that script, run scripts below for running the build.

### 3. Running the App

You have two options to run the app, either from the project root or from the \`mobile\` folder.

#### Option 1: From the Project Root

Run the following command from the root of project

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
Also, before scanning the code or triggering the simulator, you can toggle development and local build by pressing key 's'

### For Android Simulator

1. Install and configure [Android Studio](https://developer.android.com/studio).
2. Run the initial command (\`npm run native\` or \`npm run start\`).
3. Press \`a\` in the terminal to launch the Android simulator.

### For iPhone Simulator

1. Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835) and set up the Xcode simulator.
2. Run the initial command (\`npm run native\` or \`npm run start\`).
3. Press \`i\` in the terminal to launch the iPhone simulator.

---

## Application build

### 1. Install Dependencies

First, install the required dependencies using npm globally for eas support:

```bash
npm install -g eas-cli
```

and

```bash
npm install -g expo-cli
```

Also, add this line of code to .zshrc file if you get error: zsh: command not found: eas.
Then, restart the terminal and go to next steps

```
export PATH="$PATH:$(npm get prefix)/bin"
```

### 2. Login to expo account

Run the command and then enter credentials.

1. Email: accounts@careerfairy.io
2. Password: Ask Matilde Ramos or Carlos Rijo

```bash
eas login
```

### 3. Build the app

Move to apps/mobile folder:

```bash
cd apps/mobile
```

Run following commands for environments:

1. Preview (apk): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile preview
```

or from the root

```bash
npm run native-build:preview
```

2. Development (dev build): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile development
```

or from the root

```bash
npm run native-build:develop
```

3. Production (app/play store build): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile production
```

or from the root

```bash
npm run native-build:prod
```

NOTE: For iOS build, you need apple credentials

After build, starts, you will get a link of current build process, or just go to https://expo.dev/, login to the account, go to dashboard and click on latest build.

---

NOTE for iOS for deep linking to work:

in file apple-app-site-association

1. Replace <TEAM_ID> with your Apple Developer Team ID (found in your Apple Developer account).
2. Replace <BUNDLE_ID> with your app's bundle identifier.

Happy coding! 🎉
