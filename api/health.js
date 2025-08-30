// /api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}