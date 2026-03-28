function doGet() {
  return HtmlService.createHtmlOutputFromFile('index') // Nhớ đổi tên file HTML thành index nếu thầy đặt khác
      .setTitle('Huấn luyện viên AI - Cầu lông 10')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processVideo(fileData, fileName) {
  const API_KEY = 'AIzaSyBvKcfZ_XyxZ7k61DTELWcX-ZwfopWM9XM'; 
  const FOLDER_ID = '1zRSY-6Ub1Kgx-DGNrjqVrz6D5jylYfPG';
  
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = fileData.substring(5, fileData.indexOf(';'));
    const base64Content = fileData.split(',')[1];
    
    // Lưu file vào Drive để thầy quản lý bài tập học sinh
    const bytes = Utilities.base64Decode(base64Content);
    const blob = Utilities.newBlob(bytes, contentType, fileName);
    folder.createFile(blob);
    
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;
    
    const payload = {
      "contents": [{
        "parts": [
          {"text": "Bạn là chuyên gia cầu lông HDC Study. Hãy phân tích video kỹ thuật này của học sinh. Chỉ ra: 1. Ưu điểm. 2. Lỗi sai cụ thể. 3. Cách khắc phục. Giọng văn khích lệ, gần gũi với học sinh lớp 10."},
          {"inline_data": {
            "mime_type": contentType,
            "data": base64Content
          }}
        ]
      }]
    };

    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true 
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() !== 200) {
      return "⚠️ Lỗi kết nối AI: " + (result.error ? result.error.message : "Hệ thống bận");
    }
    
    if (result.candidates && result.candidates[0].content) {
      return result.candidates[0].content.parts[0].text;
    }
    return "AI không thể nhìn rõ kỹ thuật trong video này, em hãy quay góc rộng và sáng hơn nhé!";
    
  } catch (e) {
    return "❌ Lỗi hệ thống: " + e.toString();
  }
}
  function appendMessage(sender, text, isVideo = false, videoData = "") {
    const chatBody = document.getElementById('chatBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    
    let html = `<div class="message-content">${text}</div>`;
    if (isVideo) {
      html += `<video src="${videoData}" controls></video>`;
    }
    
    msgDiv.innerHTML = html;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msgDiv;
  }

  function handleFileSelect() {
    const fileInput = document.getElementById('videoFile');
    const display = document.getElementById('fileNameDisplay');
    const btn = document.getElementById('sendBtn');
    
    if (fileInput.files.length > 0) {
      display.value = fileInput.files[0].name;
      btn.disabled = false;
    }
  }

  function processUpload() {
    const fileInput = document.getElementById('videoFile');
    const btn = document.getElementById('sendBtn');
    
    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    // 1. Hiện video người dùng gửi lên chat
    const videoUrl = URL.createObjectURL(file);
    appendMessage('user', `Em gửi bài: ${file.name}`, true, videoUrl);

    // 2. Trạng thái chờ
    btn.disabled = true;
    const loadingMsg = appendMessage('ai', '<span class="loading-text">AI đang xem video và phân tích kỹ thuật, em đợi thầy một lát nhé... ⏳</span>');

    reader.onload = function(e) {
      // 3. Gửi dữ liệu sang hàm processVideo trong Code.gs
      google.script.run
        .withSuccessHandler(res => {
          loadingMsg.innerHTML = `<div class="message-content">✅ <strong>Nhận xét chuyên môn:</strong><br>${res.replace(/\n/g, '<br>')}</div>`;
          // Reset form
          fileInput.value = "";
          document.getElementById('fileNameDisplay').value = "";
        })
        .withFailureHandler(err => {
          loadingMsg.innerHTML = `<div class="message-content">❌ Lỗi hệ thống: ${err}</div>`;
          btn.disabled = false;
        })
        .processVideo(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  }
