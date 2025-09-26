# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo SDK 54 and TypeScript. The project uses:
- test questiosn can be generated via OpenIA APIs from topic, experience level and difficulty level
- Can give test and generate result
- view previously given tests
- **Expo Router** for file-based routing and navigation
- **React Native New Architecture** enabled with React Compiler experiments
- **TypeScript** with strict mode for type safety
- **ESLint** with Expo configuration for code quality

## Development Commands

### Core Commands
- `npm start` or `expo start` - Start the Expo development server
- `expo start --android` - Start with Android emulator/device
- `expo start --ios` - Start with iOS simulator/device
- `expo start --web` - Start web version
- `npm run lint` - Run ESLint to check code quality
- `npm run reset-project` - Reset project to blank state (moves current code to app-example)

### Package Management
- `npm install` - Install dependencies
- `npm ci` - Clean install from package-lock.json

## Code Architecture

### Routing Structure
The app uses **Expo Router** with file-based routing in the `/app` directory:
- `app/_layout.tsx` - Root layout with Stack navigator (headerShown: false)
- `app/(tabs)/_layout.tsx` - Tab navigation layout
- `app/(tabs)/(home)/` - Home tab screens
- `app/+not-found.tsx` - 404 error screen

### Navigation Pattern
- Root Stack → Tabs → Individual Screens
- All navigation managed through Expo Router with typed routes enabled
- Uses grouped routes syntax: `(tabs)` and `(home)` for organization

### TypeScript Configuration
- **Strict mode** enabled for better type safety
- Path aliases configured: `@/*` maps to project root
- Extends `expo/tsconfig.base` for Expo-specific TypeScript settings
- Includes generated types from `.expo/types/`

### Styling & UI
- Uses React Native core components (View, Text, etc.)
- Inline styles pattern currently used
- Expo Vector Icons available for icons
- React Native Reanimated and Gesture Handler for animations

## Key Configuration Files

### app.json
- Expo configuration with app metadata
- Platform-specific settings for iOS/Android/Web
- Adaptive icon configuration for Android
- Splash screen settings with light/dark theme support
- Experiments: `typedRoutes` and `reactCompiler` enabled

### ESLint Setup
- Uses flat config format (`eslint.config.js`)
- Extends `eslint-config-expo/flat` for Expo-specific rules
- Ignores `dist/*` directory

### VS Code Configuration
- Auto-fix and organize imports on save
- Recommends `expo.vscode-expo-tools` extension
- Code actions configured for source fixing and import organization

## Development Guidelines

### File Structure
- Place new screens in appropriate route groups under `/app`
- Follow TypeScript strict mode - add proper type annotations
- Use Expo Router's Link component for navigation between screens
- Leverage the existing path alias `@/` for clean imports

### Code Quality
- Run `npm run lint` before committing changes
- ESLint will auto-fix many issues, organize imports, and sort members
- TypeScript compiler will enforce strict type checking

### Platform Considerations
- The app targets iOS, Android, and Web platforms
- Uses Expo's universal approach - most code runs on all platforms
- Platform-specific code can be added using `.ios.tsx`, `.android.tsx`, `.web.tsx` extensions