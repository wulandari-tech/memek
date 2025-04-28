const socket = io();

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
        showToast('Gagal mengirim pesan.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  });
});

function showToast(text, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = text;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
