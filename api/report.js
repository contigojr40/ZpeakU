// api/video-report.js
import { getVideo, addReport, countReports, hideVideo } from './_store.js';

const THRESHOLD = Number(process.env.REPORT_THRESHOLD || 3);

/**
 * POST /api/video-report
 * body: { videoId: number, reporterId?: string, reason?: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const { videoId, reporterId, reason } = body || {};

    if (!videoId) {
      return res.status(400).json({ ok: false, error: 'videoId es requerido' });
    }

    const video = getVideo(videoId);
    if (!video) {
      return res.status(404).json({ ok: false, error: 'video no encontrado' });
    }

    // Registrar reporte
    const report = addReport({ videoId, reporterId, reason });

    // Contar y decidir
    const total = countReports(videoId);
    let action = 'none';

    if (video.public && total >= THRESHOLD) {
      hideVideo(videoId);     // auto-hide
      action = 'auto_hidden';
    }

    return res.json({
      ok: true,
      data: {
        videoId: Number(videoId),
        reports_total: total,
        threshold: THRESHOLD,
        action,            // 'none' | 'auto_hidden'
        status: getVideo(videoId).status,
        public: getVideo(videoId).public
      }
    });
  } catch (err) {
    console.error('video-report error', err);
    return res.status(500).json({ ok: false, error: 'error interno' });
  }
}