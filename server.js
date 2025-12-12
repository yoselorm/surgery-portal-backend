const express = require('express');
const cors = require('cors')
const database = require('./config/db');
const authRouter = require('./routes/authRoute');
const adminRouter = require('./routes/adminRoute');

const app = express()
const PORT = 4000

app.use(cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));



app.use(express.json())
app.use(express.urlencoded({extended: true}))

database()



app.use('/api/v1',authRouter)
app.use('/api/v1',adminRouter)


app.listen(PORT,()=>{
    console.log(`Portal running on port ${PORT}`);
    
})