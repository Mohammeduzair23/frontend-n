# MedicareHub

A modern healthcare mobile application built with Expo and React Native for patient-focused medical management. The app provides a secure and user-friendly experience for managing health information, appointments, prescriptions, lab results, notifications, and profile details.

## Project Overview

MedicareHub is designed to give patients a centralized digital space to access essential healthcare services from their mobile devices. The current version includes authentication, patient dashboard functionality, notifications, appointment tracking, and profile management.

## Current Status

This project has evolved beyond the default starter app and now includes:

- User login, registration, and email verification flow
- Patient dashboard with health summary and quick access cards
- Medical records and lab result views
- Prescription tracking and record management
- Appointment listing and upcoming appointment panel
- Notification center with unread badge support
- Secure local storage for user data and auth state
- Responsive mobile UI built with Expo Router and NativeWind styling

## Tech Stack

- React Native
- Expo SDK
- Expo Router
- TypeScript
- NativeWind
- Zustand for app state
- Expo Secure Store
- Axios for API integration

## Project Structure

```text
frontend-n/
├── app/                                # Main app screens and routing
│   ├── _layout.tsx                     # App-level layout
│   ├── index.tsx                       # Landing/home screen with login redirect
│   ├── login.tsx                       # Login screen
│   ├── register.tsx                    # Registration screen
│   ├── forgot-password.tsx             # Password recovery flow
│   ├── verify-email.tsx                # Email verification flow
│   ├── notifications.tsx               # Notification center
│   ├── profile.tsx                     # User profile page
│   ├── appointments-list.tsx          # Appointment list screen
│   ├── doctor-search.tsx               # Doctor search flow
│   ├── appointment-request.tsx        # Appointment request form
│   └── patient/                        # Patient module screens
│       ├── _layout.tsx                 # Patient navigation layout
│       ├── index.tsx                   # Patient dashboard
│       ├── lab.tsx                     # Lab result screen
│       ├── medical.tsx                 # Medical record screen
│       ├── prescription.tsx            # Prescription screen
│       └── more.tsx                    # Additional settings/options
│
├── components/                         # Reusable UI components
│   ├── Avatar.tsx                      # User avatar
│   ├── Button.tsx                      # Shared button component
│   ├── ConfirmModal.tsx                # Confirmation modal
│   ├── InlineToast.tsx                 # Toast notification component
│   ├── Input.tsx                       # Input fields
│   └── patient/                        # Patient-specific UI components
│       ├── RecordCard.tsx              # Medical record card
│       ├── RecordFormModal.tsx         # Record form modal
│       └── RecordListScreen.tsx        # Record list view
│
├── lib/                                # App logic and data layer
│   ├── api.ts                          # Base API client
│   ├── appointments-api.ts             # Appointment data functions
│   ├── appointments-store.ts           # Appointment state store
│   ├── auth-store.ts                   # Authentication state
│   ├── doctor-search-api.ts            # Doctor search API logic
│   ├── medical-api.ts                  # Medical records API layer
│   ├── notifications-api.ts            # Notification API logic
│   ├── notifications-store.ts          # Notification state
│   ├── patient-dashboard.ts            # Dashboard data logic
│   ├── profile-store.ts                # Profile state management
│   ├── records-config.ts               # Record configuration settings
│   ├── secure-store.ts                 # Secure persistent storage
│   ├── toast-store.ts                  # Toast state store
│   ├── userApi.ts                      # User-related API calls
│   └── ...
│
├── assets/                             # Static resources
│   └── images/
│
├── app-example/                        # Default Expo starter app
├── global.css                          # Global styling
├── nativewind-env.d.ts                 # NativeWind environment types
├── app.config.ts                       # Expo configuration
├── metro.config.js                     # Metro bundler config
├── eslint.config.js                    # ESLint config
├── postcss.config.mjs                  # PostCSS config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Project dependencies and scripts
├── README.md                           # Project documentation
├── AGENTS.md                           # Agent instructions
├── CLAUDE.md                           # Claude project notes
└── .gitignore                          # Git ignore rules
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
npm install
```

### Run the app

```bash
npx expo start
```

You can then choose to run the app in:

- Expo Go
- Android emulator
- iOS simulator
- Development build

## Working Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npm run reset-project
```

## Key Features

- Secure patient authentication flow
- Health dashboard with quick access panels
- Medical record viewing and management
- Lab report overview
- Medication and prescription tracking
- Appointment management
- Notification center with unread indicators
- Profile and personal information management
- Mobile-first, responsive user experience

## Current Development Focus

The app is currently centered around a patient healthcare experience with emphasis on:

- health record visibility
- appointment tracking
- secure healthcare information access
- streamlined patient-facing workflows

## Notes

This project is actively being developed as a healthcare management app and continues to evolve with additional patient and medical features.

## License

This project does not currently include a public license file. Add a license before publishing or sharing the project externally.
