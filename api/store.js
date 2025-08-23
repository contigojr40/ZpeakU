// api/_store.js
// In-memory store (persiste mientras la función viva en el mismo worker)
const g = globalThis.__ZPEAKU_STORE__ || {
  seq: 1,
  videos: [],       // [{ id, creatorId, title, url, status, public, reports: number, created_at }]
  reports: [],      // [{ id, videoId, reporterId, reason, created_at }]
};
globalThis.__ZPEAKU_STORE__ = g;

// Helpers
export function addVideo(data) {
  const v = {
    id: g.seq++,
    created_at: Date.now(),
    status: 'approved', // para tu nuevo flujo: sube → visible
    public: true,
    reports: 0,
    ...data,
  };
  g.videos.push(v);
  return v;
}

export function getVideo(id) {
  return g.videos.find(v => v.id === Number(id));
}

export function listPublicVideos() {
  return g.videos
    .filter(v => v.public && v.status === 'approved')
    .sort((a, b) => b.created_at - a.created_at);
}

export function hideVideo(id) {
  const v = getVideo(id);
  if (!v) return null;
  v.public = false;
  v.status = 'flagged'; // oculto por reportes; pendiente de revisión
  return v;
}

export function addReport({ videoId, reporterId, reason }) {
  const r = {
    id: g.seq++,
    videoId: Number(videoId),
    reporterId: reporterId ? String(reporterId) : null,
    reason: reason || null,
    created_at: Date.now(),
  };
  g.reports.push(r);
  const v = getVideo(videoId);
  if (v) v.reports = (v.reports || 0) + 1;
  return r;
}

export function countReports(videoId) {
  const v = getVideo(videoId);
  return v ? v.reports || 0 : 0;
}