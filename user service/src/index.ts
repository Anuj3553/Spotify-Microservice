import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './route.js';
import cors from 'cors';

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'Spotify'
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
}

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('User Service is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
});