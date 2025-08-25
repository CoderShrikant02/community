# Copilot Instructions

## Project Overview


## Coding Style
- for database use mysql

## File/Folder Structure
- `frontend/` → React Native (Expo) app.
- `backend/` → Node.js + Express server.
- `config/` → Environment variables and configuration files.
- `docs/` → Documentation files.

## Best Practices
- Prefer functional components over class components (React Native).
- Use async/await for asynchronous code instead of `.then/.catch`.
- Ensure all API endpoints return JSON.
- Validate API inputs before processing.
- Handle errors gracefully and provide meaningful error messages.

## Git & Commits
## ✅ Check before running
- Always check if **frontend** and **backend** are already running.
- If they are running, **do not start them again**.

---
## ▶️ Run Backend
```bash
cd backend; node server.js
```
## ▶️ Run Frontend
```bash
cd mavs; npx expo start
```

## Testing
- Write unit tests for backend routes.
- Use [Jest/Mocha/React Testing Library] for testing.
- Ensure code is tested before pushing to main branch.

## Documentation
- Keep this `copilot-instructions.md` updated as the project evolves.
- Write clear README files for frontend and backend.
- Document API endpoints in `docs/api.md`.

## Security
- Never hardcode API keys or secrets in code.
- Use `.env` files for sensitive configurations.
- Sanitize all inputs to prevent security issues.

## Additional Notes
- Use TypeScript if possible for type safety.
- Prefer reusable components instead of duplicate code.
- Optimize performance where necessary (e.g., lazy loading, memoization).
