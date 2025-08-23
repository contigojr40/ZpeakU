export const Lottery = {
  async refreshStatus() {
    const box = document.getElementById('lottery-status');
    box.textContent = 'Cargando…';
    const res = await fetch('/api/lottery/status.js');
    const data = await res.json();
    box.innerHTML = `
      <strong>Mes:</strong> ${data.month} <br/>
      <strong>Total participantes:</strong> ${data.total_entries} <br/>
      <strong>Método:</strong> ${data.method} <br/>
      <strong>Ganador provisional:</strong> ${data.winner_index ?? '—'}
    `;
  }
};
document.addEventListener('DOMContentLoaded', Lottery.refreshStatus);