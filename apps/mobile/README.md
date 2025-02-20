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
When testing on branch and created a PR, use the PR preview url that should be in pattern: https://careerfairy-ssr-webapp-pr-[pr-number].vercel.app

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

1. Development (dev build): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile development
```

or from the root

```bash
npm run native-build:develop
```

2. Development Isolated (for PR testing): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile development-isolated
```

or from the root

```bash
npm run native-build:develop-isolated
```

The isolated development build is primarily used for testing PRs remotely. Unlike regular development builds:

-  No connection to Expo dev client/CLI required
-  Can be distributed to testers without tunneling setup
-  No hot-reload functionality (trade-off for easier distribution)
-  Perfect for getting feedback from testers who don't need development environment access

3. Production (app/play store build): After running the command, choose which platforms, Android, iOS or both

```bash
eas build --profile production
```

or from the root

```bash
npm run native-build:prod
```

Note: If you are running a build for a new release on the app store, you will need to bump the version on the app.json file.

### Installing Development Builds

After creating a development build, you can install it directly to your connected device or simulator using the `eas build:run` command. Here's what you need to do:

#### Prerequisites

1. For iOS:

   -  Xcode installed
   -  iOS device connected via USB or simulator running

2. For Android:
   -  Android Studio installed
   -  Android device connected via USB (with USB debugging enabled) or emulator running

#### Installing the Build

Run one of the following commands based on your platform:

```bash
# For iOS
eas build:run -p ios
# or from mobile directory
npm run run:ios
# or from project root
npm run native-run:ios

# For Android
eas build:run -p android
# or from mobile directory
npm run run:android
# or from project root
npm run native-run:android
```

The command will automatically download the latest development build for your platform and install it on your connected device or running simulator.

---

### Local Development Build

1. Run

```bash
npm run dev
```

2. On next terminal window, run (from root)

```bash
npm run native:cache
```

#### For iOS (Only local build)

In .env file, set BASE_URL to http://127.0.0.1:3000 and SEARCH_CRITERIA to 127.0.0.1

after running the script, type 'i' to run iOS emulator

### Troubleshooting tips

Sometimes, iOS simulator will have black screen

1. Make sure when running iOS simulator, that in terminal you see download of bundle to iOS emulator
2. If there is no download, there is probably cache with iOS emulator
3. Try closing the iOS emulator and running 'i' again
4. If that does not help, go to apple system settings -> Storage -> Developer -> Choose xCode cache and delete it
5. Try then running the flow again

#### For Android and Expo GO application

Currently, android and expo go cannot work, as for android emulator, it only works with http://10.0.2.2:3000 accessing localhost, and it will load the app, but will not be able to contact backend services.
Same thing for Expo GO, which needs exposed local ip address and it will have the same effect

---

NOTE for iOS for deep linking to work:

in file apple-app-site-association

1. Replace <TEAM_ID> with your Apple Developer Team ID (found in your Apple Developer account).
2. Replace <BUNDLE_ID> with your app's bundle identifier.

Happy coding! 🎉
