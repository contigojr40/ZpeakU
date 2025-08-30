// payments.js

export const Payments = {
  // Crear una suscripción
  async subscribe20() {
    const res = await fetch('/api/subscription.js', { method: 'POST' });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible iniciar el checkout.');
  },

  // Donación rápida (ejemplo con 5 USD)
  async quickDonate(amount = 5) {
    const res = await fetch('/api/donation.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible iniciar la donación.');
  },

  // Conectar cuenta Stripe
  async connectStripe() {
    const res = await fetch('/api/connect.js', { method: 'POST' });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible abrir el onboarding.');
  },

  // Verificar si el usuario tiene suscripción activa
  async checkSubscription() {
    const res = await fetch('/api/status.js');
    const data = await res.json();
    alert(data?.active ? 'Tienes suscripción activa ✅' : 'No tienes suscripción activa ❌');
  }
};