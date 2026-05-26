Backend skill

Scope
- Express API in back-end/src.

Structure
- Use the module template in back-end/src/modules/_template.
- Routes only map endpoints and middleware.
- Controllers validate input, call service, and format response.
- Services implement business rules only.
- Repo contains SQL only and uses config/db.js query.

Validation
- Use zod schemas.
- Apply validateBody(schema) in routes.

Pagination
- Use parsePagination(req.query) in controllers.
- Repo should accept { limit, offset } and return { items, total }.
- List response: { data, meta: { page, limit, total } }.

Auth
- Use requireAuth and requireRole where needed.

Registration
- Add module routes in back-end/src/server.js under /api.

Response shape
- Success: { data }
- Error: { error: { message, status, code? } }
