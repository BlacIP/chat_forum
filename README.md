# Overview

ForumHub is a Node.js web application that I built to deepen my experience with full-stack JavaScript. It delivers a lightweight discussion board where community members can browse conversations, dive into thread details, add their own posts, and give moderators the tooling they need to keep discussions healthy.

To explore ForumHub locally, install dependencies with `npm install`, copy `.env.example` to `.env`, and start the development server using `npm run dev`. The site becomes available at [http://localhost:3000](http://localhost:3000), where you can register, sign in, and begin posting right away.

My goal with this project was to practice building a production-style Express app: clean modular controllers, server-rendered views, session-based authentication, and a MongoDB-backed data model. I focused on ensuring user input flows directly into the rendered pages, enabling a responsive forum experience.

[Software Demo Video](https://youtu.be/qA7SciUrfuA)

# Web Pages

- **Home (`/`)** – Displays dynamic categories and their latest threads. The page is driven entirely by server data fetched from MongoDB, including post counts and timestamps that update as users contribute.
- **Thread Detail (`/threads/:id`)** – Shows the selected thread, all replies, flagging controls, and a reply form. New posts, moderation notes, and lock status render instantly after each action.
- **Moderation Dashboard (`/moderation`)** – Lists flagged posts for moderators, offering approve/remove decisions and thread locking controls, all powered by live database queries.
- **User Role Management (`/moderation/users`)** – Available to super moderators, this page lets trusted admins promote or demote accounts, with form submissions persisting new roles to MongoDB.
- **Auth Pages (`/auth/login`, `/auth/register`)** – Handle account creation and sign-in with form validation feedback, redirecting to the appropriate pages on success.

# Development Environment

- **Tools**: Visual Studio Code, Nodemon for auto-restarts, MongoDB Atlas/Compass for database management.
- **Languages & Libraries**: Node.js, Express 5, EJS templating, MongoDB Node.js Driver (Stable API v1), express-session, connect-flash, bcryptjs, and dotenv for configuration.

# Tech Stack
- Node.js + Express 5
- EJS templates and custom CSS
- MongoDB Node.js Driver (Stable API v1)
- express-session and bcryptjs for lightweight authentication

# Getting Started
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

# Initial Admin Setup
After you register your first user, promote it to a super moderator directly in MongoDB so you can access the role management console:

```js
db.users.updateOne(
  { username: '<your-username>' },
  { $set: { role: 'super' } }
)
```
Run the command in MongoDB Compass, Atlas, or the shell connected to your database.

# Useful Websites

* [Express.js Documentation](https://expressjs.com/)
* [MongoDB Node.js Driver Docs](https://www.mongodb.com/docs/drivers/node/current/)
* [MDN Web Docs – Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)

# Future Work

* Add pagination and search across threads and posts.
* Implement automated tests (integration and unit coverage).
* Introduce richer moderation features like soft deletes and audit logs.
