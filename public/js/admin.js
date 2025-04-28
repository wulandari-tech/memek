const socket = io();
const messagesTable = document.getElementById('messagesTable');
const exportJsonBtn = document.getElementById('exportJson');
const exportCsvBtn = document.getElementById('exportCsv');

document.addEventListener('DOMContentLoaded', () => {
  loadMessages();

  exportJsonBtn.addEventListener('click', () => {
    window.open('/api/export/json', '_blank');
  });

  exportCsvBtn.addEventListener('click', () => {
    window.open('/api/export/csv', '_blank');
  });
});

socket.on('messageToAdmin', (data) => {
  addMessageRow(data, messagesTable.rows.length);
});

socket.on('deleteMessage', (index) => {
  messagesTable.deleteRow(index + 1); // karena header di baris ke-0
});

async function loadMessages() {
  try {
    const response = await fetch('/api/messages');
    const messages = await response.json();
    messagesTable.innerHTML = `
      <tr>
        <th>#</th>
        <th>Pesan</th>
        <th>Kode</th>
        <th>Waktu</th>
        <th>Aksi</th>
      </tr>
    `;
    messages.forEach((msg, idx) => {
      addMessageRow(msg, idx);
    });
  } catch (err) {
    console.error('Gagal load pesan:', err);
  }
}

function addMessageRow(msg, index) {
  const row = messagesTable.insertRow();
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${msg.message}</td>
    <td>${msg.code || '-'}</td>
    <td>${new Date(msg.time).toLocaleString()}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deleteMessage(${index})">Hapus</button></td>
  `;
}

async function deleteMessage(index) {
  if (confirm('Yakin mau hapus pesan ini?')) {
    try {
      const response = await fetch(`/api/delete/${index}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        showToast('Pesan berhasil dihapus.', 'success');
        // Tidak perlu reload, sudah realtime lewat socket
      } else {
        showToast('Gagal menghapus pesan.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  }
}

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
