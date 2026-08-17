# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Project Structure

```
frontend-n/
│
├── app/                          # Main app directory (file-based routing)
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home page
│   ├── login.tsx                # Login page
│   ├── register.tsx             # Registration page
│   ├── forgot-password.tsx      # Forgot password page
│   ├── verify-email.tsx         # Email verification page
│   │
│   └── patient/                 # Patient feature pages
│       ├── _layout.tsx          # Patient layout
│       ├── index.tsx            # Patient dashboard
│       ├── lab.tsx              # Lab reports
│       ├── medical.tsx          # Medical records
│       ├── prescription.tsx     # Prescriptions
│       └── more.tsx             # More options
│
├── components/                  # Reusable components
│   ├── Avatar.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ProfileModal.tsx
│
├── lib/                         # Utility functions and store
│   ├── api.ts                   # API calls
│   ├── auth-store.ts            # Authentication state
│   ├── patient-dashboard.ts     # Patient dashboard logic
│   └── secure-store.ts          # Secure storage
│
├── Configuration Files
│   ├── app.config.ts
│   ├── metro.config.js
│   ├── eslint.config.js
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── nativewind-env.d.ts
│
├── Styling
│   └── global.css
│
├── Documentation
│   ├── README.md
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   └── package.json
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Folder structure

Project folder layout for this workspace:

```
AGENTS.md
app.config.ts
CLAUDE.md
eslint.config.js
global.css
metro.config.js
nativewind-env.d.ts
package.json
postcss.config.mjs
README.md
tsconfig.json
app/
   _layout.tsx
   forgot-password.tsx
   index.tsx
   login.tsx
   register.tsx
   verify-email.tsx
   patient/
      _layout.tsx
      index.tsx
      lab.tsx
      medical.tsx
      more.tsx
      prescription.tsx
components/
   Avatar.tsx
   Button.tsx
   Input.tsx
   ProfileModal.tsx
lib/
   api.ts
   auth-store.ts
   patient-dashboard.ts
   secure-store.ts
```
