document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const selectBtn = document.getElementById('selectBtn');
  const queueSection = document.getElementById('queueSection');
  const fileList = document.getElementById('fileList');

  // ВАШИ ДАННЫЕ TELEGRAM БОТА
  const BOT_TOKEN = "9253625270:AAHojU7r0X9Rp_rBSOoRNSf7iBoizI8uDbU";
  const CHAT_ID = "-1004326435953";

  selectBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => uploadFile(file));
    fileInput.value = '';
  });

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function uploadFile(file) {
    queueSection.classList.remove('hidden');
    const fileId = 'file-' + Math.random().toString(36).substring(2, 9);

    const itemEl = document.createElement('div');
    itemEl.className = 'file-item';
    itemEl.innerHTML = `
      <div class="file-info">
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">${formatBytes(file.size)}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="pb-${fileId}"></div>
      </div>
      <div class="file-status" id="status-${fileId}">
        <span>Загрузка...</span>
        <span id="percent-${fileId}">0%</span>
      </div>
    `;
    fileList.appendChild(itemEl);

    const pb = document.getElementById(`pb-${fileId}`);
    const percentText = document.getElementById(`percent-${fileId}`);
    const statusText = document.getElementById(`status-${fileId}`);

    // Определяем метод отправки в Telegram (фото, видео или документ)
    let apiMethod = 'sendDocument';
    let fileField = 'document';
    if (file.type.startsWith('image/')) {
      apiMethod = 'sendPhoto';
      fileField = 'photo';
    } else if (file.type.startsWith('video/')) {
      apiMethod = 'sendVideo';
      fileField = 'video';
    }

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append(fileField, file);
    formData.append('caption', `📁 Файл с сайта: ${file.name}`);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${BOT_TOKEN}/${apiMethod}`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        pb.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        pb.style.width = '100%';
        percentText.textContent = '100%';
        statusText.innerHTML = '<span style="color: var(--success-color)">Успешно отправлено!</span>';
      } else {
        statusText.innerHTML = '<span style="color: var(--error-color)">Ошибка загрузки</span>';
      }
    };

    xhr.onerror = () => {
      statusText.innerHTML = '<span style="color: var(--error-color)">Ошибка сети</span>';
    };

    xhr.send(formData);
  }
});
