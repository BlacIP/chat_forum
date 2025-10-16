# ForumHub

ForumHub is a Node.js and Express-powered discussion board that demonstrates dynamic server-rendered HTML, user-driven interactions, and MongoDB persistence. It fulfills the module requirements by serving multiple dynamic pages (home, thread detail, moderation), processing user input for threads and replies, and integrating a database-backed data model.

## Tech Stack
- Node.js + Express 5
- EJS templates and custom CSS
- MongoDB Node.js Driver (Stable API v1)
- Express-session and bcryptjs for lightweight authentication

## Getting Started
1. **Clone & install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   - Set a unique `SESSION_SECRET`.
   - Optionally adjust `DB_NAME` (defaults to `forumhub`).
   - The sample `.env` targets the course Atlas cluster (`omotoyinbobade15 / blac123`). Update the credentials if yours differ, or swap the URI for a local MongoDB instance.
3. **Run a MongoDB instance**
   - Local: `mongod --dbpath <path to data directory>`
   - Atlas: ensure your IP is whitelisted in the Atlas project and the connection string in `.env` matches the format above.
4. **Start the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to interact with the app.

## Initial Admin Setup
After you register your first user, promote it to a super moderator directly in MongoDB so you can access the role management console:

```js
db.users.updateOne(
  { username: '<your-username>' },
  { $set: { role: 'super' } }
)
```
Run the command in MongoDB Compass, Atlas, or the shell connected to your database.

## Key Features
- **Dynamic Pages**: 
  - `GET /` – category-based thread listing populated by MongoDB queries.
  - `GET /threads/:id` – detailed thread view with replies, flagging, and reply form.
  - `GET /moderation` – moderator-only dashboard for flagged content and locking threads.
  - `GET /moderation/users` – super moderator console for assigning or revoking roles.
- **Interactive Workflows**:
  - Authenticated users can create threads, post replies, and flag posts.
  - Sessions persist login state; flash messages provide real-time feedback.
- **Database Integration**:
  - Collections for users, threads, and posts managed via the official MongoDB driver.
  - Moderation actions update documents and reflected immediately in server-rendered pages.

## Available Scripts
- `npm run dev` – start the server with Nodemon for hot reloads.
- `npm start` – run the production server with Node.

## Project Structure
```
config/             MongoDB connection helper
controllers/        Route handlers (threads, auth, moderation)
middleware/         Session/role helpers
models/             Data access helpers for users, threads, posts
public/             Static CSS assets
routes/             Express routers grouped by concern
seed/               Utility to populate sample data
views/              EJS templates for pages and partials
server.js           Express bootstrap file
```

## Manual Testing Checklist
- Register a new account, log in, and confirm flash feedback.
- Create a thread and verify it appears on the homepage with accurate counts.
- Add replies to a thread and ensure they render chronologically.
- Flag a reply, sign in as the moderator, and approve/remove the post from the dashboard.
- Sign in as the super moderator, promote a member to moderator, and confirm role-restricted navigation updates.
- Lock a thread and confirm members can no longer post replies.

## Known Limitations
- Password reset and email confirmation flows are out of scope for this module.
- CSRF protection is not enabled; add middleware such as `csurf` before deploying publicly.
- Moderation actions are intentionally simple; extend with audit logging if needed.

## Next Steps
- Add pagination for large thread/post volumes.
- Introduce unit/integration tests (e.g., Vitest + Supertest) for controllers and middleware.
- Enhance accessibility by incorporating ARIA roles and keyboard navigation audits.
