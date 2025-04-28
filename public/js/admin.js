// public/js/admin.js

const socket = io();
const messageList = document.getElementById('messageList');
const exportBtn = document.getElementById('exportBtn');

socket.on('messageToAdmin', (message) => {
  appendMessage(message);
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadMessages();

  exportBtn.addEventListener('click', () => {
    window.location.href = '/api/export';
  });
});

// Load all messages
async function loadMessages() {
  try {
    const response = await fetch('/api/history');
    const data = await response.json();
    if (data.success && data.messages.length > 0) {
      data.messages.forEach(msg => appendMessage(msg));
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Append message to list
function appendMessage(msg) {
  const li = document.createElement('li');
  li.className = 'flex justify-between items-center bg-white p-3 mb-2 rounded shadow-sm';

  const textDiv = document.createElement('div');
  textDiv.innerHTML = `
    <p class="font-semibold">${msg.message}</p>
    <small class="text-gray-500">${new Date(msg.time).toLocaleString()}</small>
    <small class="text-blue-500">Code: ${msg.code || '-'}</small>
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'bg-red-500 text-white px-2 py-1 rounded ml-3';
  deleteBtn.innerText = 'Hapus';
  deleteBtn.onclick = () => deleteMessage(li);

  li.appendChild(textDiv);
  li.appendChild(deleteBtn);
  messageList.prepend(li);
}

// Delete message
async function deleteMessage(li) {
  const index = Array.from(messageList.children).indexOf(li);

  if (confirm('Yakin ingin menghapus pesan ini?')) {
    try {
      const response = await fetch(`/api/delete/${index}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        li.remove();
        showToast('Pesan berhasil dihapus!', 'success');
      } else {
        showToast('Gagal menghapus pesan!', 'error');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Terjadi kesalahan server!', 'error');
    }
  }
}

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
