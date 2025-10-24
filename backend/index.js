import express from 'express';
import dotenv from 'dotenv';
import appRouter from './src/app.router.js';
import connectDB from './DB/dbConnection.js';

dotenv.config();

const app = express();

// ✅ CRITICAL: Remove Socket.io for Vercel compatibility
// ✅ Remove HTTP server creation

// Basic route
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend is working on Vercel!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ✅ CRITICAL: Global timeout middleware for all routes
app.use((req, res, next) => {
  req.setTimeout(30 * 60 * 1000); // 30 minutes
  res.setTimeout(30 * 60 * 1000); // 30 minutes
  next();
});

// ✅ Specific timeout for upload routes
app.use('/api/videos/upload', (req, res, next) => {
  req.setTimeout(30 * 60 * 1000);
  res.setTimeout(30 * 60 * 1000);
  next();
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ✅ Remove io parameter from appRouter
appRouter(app, express);

connectDB();

// ✅ Export the app for Vercel (CRITICAL)
export default app;