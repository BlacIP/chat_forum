const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db');
const threadRoutes = require('./routes/threadRoutes');
const authRoutes = require('./routes/authRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const { attachCurrentUser } = require('./middleware/auth');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://omotoyinbobade15:blac123@cluster0.raj8f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const SESSION_SECRET = process.env.SESSION_SECRET || 'forumhub-secret';
const DB_NAME = process.env.DB_NAME || 'forumhub';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(attachCurrentUser);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', threadRoutes);
app.use('/auth', authRoutes);
app.use('/moderation', moderationRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user,
  });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).render('500', {
    title: 'Server Error',
    message: err.message,
    user: req.user,
  });
});

async function start() {
  try {
    await connectDB(MONGODB_URI, DB_NAME);
    app.listen(PORT, () => {
      console.log(`ForumHub listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server due to database error.');
    process.exit(1);
  }
}

start();
