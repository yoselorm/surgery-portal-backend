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
      callback(null, origin); 
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalLimiter);

database();

app.use('/api/v1', authRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', userRoute);
app.use('/api/v1', surgeryRouter);
app.use('/api/v1', analyticsRouter);
app.use('/api/v1', doctorAnalytics);

app.listen(PORT, () => {
  console.log(`Portal running on port ${PORT}`);
});
