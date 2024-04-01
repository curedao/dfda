function createChatWindow() {
  var chatWindow = document.createElement('div');
  chatWindow.id = 'chat-window';
  chatWindow.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 80px; /* Adjusted to make room for the floating button */
            width: 300px;
            height: 400px;
            border: 1px solid #ccc;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            display: none; /* Initially hidden */
        `;
  document.body.appendChild(chatWindow);
}

// Function to open the chat iframe within the chat window
function openChat() {
  var iframe = document.createElement('iframe');
  iframe.src = "https://certainly-inspired-duck.ngrok-free.app/chat";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  var chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = ""; // Clear the container
  chatWindow.appendChild(iframe);
  chatWindow.style.display = "block"; // Show the chat window
}

// Function to toggle the visibility of the chat window
function toggleChat() {
  var chatWindow = document.getElementById('chat-window');
  if (chatWindow.style.display === "none") {
    openChat();
  } else {
    chatWindow.style.display = "none";
  }
}

// Function to create and style the floating button
function createFloatingButton() {
  var buttonImg = document.createElement('img');
  buttonImg.src = "https://fdai.earth/wp-content/uploads/2024/03/robot-head.png";
  buttonImg.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 60px; /* Adjust the size as needed */
            height: auto;
            cursor: pointer;
            z-index: 1001; /* Ensure it's above the chat window */
        `;
  buttonImg.onclick = toggleChat;

  document.body.appendChild(buttonImg);
}

// Initialize the chat window and floating button
createChatWindow();
createFloatingButton();
