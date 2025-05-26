# Contributing to Twelve More

Thank you for your interest in contributing to Twelve More! We welcome all contributions that help improve our project. Please read the following guidelines to ensure a smooth contribution process.

## Table of Contents
- [Project Overview](#project-overview)
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching & Pull Requests](#branching--pull-requests)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Commit Messages](#commit-messages)
- [Contact](#contact)

## Project Overview
Twelve More is a modern web application built with React, Next.js, Tailwind CSS, and Clerk for authentication. Progress is tracked per user, and UI is designed with Tailwind only. We use server actions for data fetching and updates, not API routes.

## Code of Conduct
Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Get the Code
 Clone the repository using the following command:
```bash
git clone https://github.com/Lolek-Productions/twelve-more.git
```
### Install Dependencies
 Install the required dependencies using npm:
```bash
npm install --force
```
### Start Development
 Start the development environment:
```bash
npm run dev
```
### Send an email fr.josh@lolekproductions.org for keys

## Branching & Pull Requests
- Create a new branch for each feature or bugfix (e.g., `feature/course-progress-bar`).
- Ensure your branch is up to date with `main` before submitting a PR.
- Open a pull request with a clear description of your changes.
- Reference related issues in your PR description.
- Wait for review and address any requested changes.

## Coding Standards
- Use **React** and **Next.js** best practices.
- Use **Tailwind CSS** for all styling. Do not use other CSS frameworks or inline styles.
- Use **server actions** for data fetching and updates. Avoid API routes for authenticated actions.
- Use **Clerk's `useUser()`** for authentication and user context.
- See our [Code Style Guide](CODE_STYLE.md) for detailed conventions.
- Write clear, maintainable, and well-documented code.
- Add or update tests as needed.

## Reporting Issues
- Use GitHub Issues to report bugs.
- Provide clear steps to reproduce, expected behavior, and screenshots if applicable.
- Check for duplicate issues before submitting.

## Feature Requests
- Use GitHub Issues to suggest new features.
- Describe the feature, its motivation, and any relevant context.

## Commit Messages
- Use clear, descriptive commit messages.
- Follow the format: `type(scope): description`
  - Examples: `feat(course): add progress bar`, `fix(auth): handle Clerk errors`

## Contact
For questions or help, open an issue or contact Fr. Josh McCarty at fr.josh@lolekproductions.org.

---

Thank you for helping make Twelve More better!
