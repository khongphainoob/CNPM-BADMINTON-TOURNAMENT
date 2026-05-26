Frontend skill

Scope
- React/Vite app in front-end/src.

Structure
- Keep shared UI in src/components/shared.
- Feature screens go to src/components/<feature>.
- Use hooks in src/hooks for data and state logic.
- Keep API calls in src/utils/axios.ts or src/data.
- Reuse tokens from src/components/shared/tokens.ts.

Rules
- Match backend response shapes: { data } and list meta.
- Keep types in src/types.ts or co-located feature types.
- Avoid adding new global styles unless required.
