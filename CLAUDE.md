# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application for a drum looper, bootstrapped with Create React App. The project uses React 19.2.0 with functional components and hooks.

## Development Commands

### Start Development Server
```bash
npm start
```
Opens the app at http://localhost:3000 with hot reload enabled.

### Run Tests
```bash
npm test
```
Launches Jest test runner in interactive watch mode.

### Build for Production
```bash
npm run build
```
Creates optimized production build in the `build/` folder.

## Code Architecture

### Entry Point
The application entry point is `src/index.js`, which renders the `App` component into the DOM using React 19's `createRoot` API with StrictMode enabled.

### Main Application
`src/App.js` contains the main application component. Currently shows the default Create React App template.

### Testing
Tests use React Testing Library and Jest. Test files follow the `*.test.js` naming convention and are configured via `src/setupTests.js`.

## Technology Stack

- React 19.2.0 (functional components and hooks)
- React Scripts 5.0.1 (Create React App tooling)
- React Testing Library for component testing
- Jest for test running

## Code Conventions

Follow the React and JavaScript conventions outlined in the global CLAUDE.md:
- Always use functional components and hooks
- Use JavaScript (not TypeScript)
- Prefer native implementations over libraries
- Remove trailing whitespace
- Always add newline to end of files
