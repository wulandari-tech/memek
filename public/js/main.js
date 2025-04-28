// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sendForm');
  const messageInput = document.getElementById('message');
  const codeInput = document.getElementById('code');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    const code = codeInput.value.trim();

    if (!message) {
      showToast('Pesan tidak boleh kosong!', 'error');
      return;
    }

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, code })
      });

      const result = await response.json();

      if (result.success) {
        showToast('Pesan berhasil dikirim!', 'success');
        form.reset();
      } else {
        showToast('Gagal mengirim pesan!', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Terjadi kesalahan server!', 'error');
    }
  });
});

// Simple Toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-5 right-5 bg-${type === 'success' ? 'green' : 'red'}-500 text-white px-4 py-2 rounded shadow-lg z-50`;
  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
