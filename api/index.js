export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'ZpeakU API',
    time: new Date().toISOString(),
    endpoints: [
      '/api/create-subscription',
      '/api/create-donation',
      '/api/connect-link',
      '/api/subscription-status',
      '/api/videos-public',
      '/api/video-submit',
      '/api/video-approve',
      '/api/video-reject',
      '/api/video-delist',
      '/api/stripe-webhook'
    ]
  });
}