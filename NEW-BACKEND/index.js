import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import pool from './src/config/db.js';
import errorHandling from './src/middlewares/errorHandler.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import createUserTable from './src/data/createUserTable.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

//Middleware
app.use(express.json());
app.use(cors()); 

//Routes
import studentRoutes from './src/routes/studentRoutes.js';

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

//Error handling middleware
app.use(errorHandling)

//Create table before staring server
createUserTable();

//Testing POSTGRES connection
app.get("/api/test", async(req , res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`The database name is : ${result.rows[0].current_database}`)
})
//Server running
app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`)
})