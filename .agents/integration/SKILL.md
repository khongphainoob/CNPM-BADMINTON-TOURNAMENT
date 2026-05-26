Integration skill

Scope
- FE and BE contract, wiring, and environment setup.

API contract
- All endpoints under /api.
- Each module exposes /health.
- Response shape is consistent with backend skill.
- List endpoints support page/limit.

Frontend wiring
- Use the axios instance in front-end/src/utils/axios.ts.
- Keep base URL in Vite env and avoid hardcoding.
- Update frontend data layer when endpoints change.

Backend wiring
- Register routes in back-end/src/server.js.
- Keep CORS enabled for the frontend dev port.

Docs
- When changing contracts, update the relevant skill file.
