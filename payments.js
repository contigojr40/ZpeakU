export const Payments = {
  async subscribe20() {
    const res = await fetch('/api/create-subscription.js', { method:'POST' });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible iniciar el checkout.');
  },
  async quickDonate(amount=5){
    const res = await fetch('/api/create-donation.js', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible iniciar la donación.');
  },
  async connectStripe(){
    const res = await fetch('/api/connect-link.js', { method:'POST' });
    const data = await res.json();
    if (data?.url) location.href = data.url;
    else alert('No fue posible abrir el onboarding.');
  },
  async checkSubscription(){
    const res = await fetch('/api/subscription-status.js');
    const data = await res.json();
    alert(data?.active ? 'Tienes suscripción activa ✅' : 'No tienes suscripción activa ❌');
  }
};