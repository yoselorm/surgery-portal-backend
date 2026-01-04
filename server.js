const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const database = require('./config/db');
const authRouter = require('./routes/authRoute');
const adminRouter = require('./routes/adminRoute');
const { globalLimiter } = require('./middlewares/rateLimiiter');
const userRoute = require('./routes/userRoute');
const surgeryRouter = require('./routes/surgeryRoute');
const analyticsRouter = require('./routes/analyticsRoute');
const doctorAnalytics = require('./routes/doctorAnalyticsRoute');

const app = express();
const PORT = process.env.PORT || 4000;

// 🔥 Must be first for Render / Secure cookies
app.set('trust proxy', 1);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://app.isolp.org",
      "https://admin.isolp.org",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // 🔥 Return the origin, not true
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Use CORS for all requests
app.use(cors(corsOptions));

// // ✅ Handle preflight for all routes
// app.options('/*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalLimiter);

// 🔥 Connect to DB
database();

// 🔥 Routes
app.use('/api/v1', authRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', userRoute);
app.use('/api/v1', surgeryRouter);
app.use('/api/v1', analyticsRouter);
app.use('/api/v1', doctorAnalytics);

app.listen(PORT, () => {
  console.log(`Portal running on port ${PORT}`);
});
