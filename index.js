const timeoutButton = document.getElementById("timeoutButton");
const timeoutInput = document.getElementById("timeoutInput");
const message = document.getElementById("message");

chrome.storage.sync.get(["timeout"], function (res) {
  timeoutInput.value = res.timeout / 1000;
});

timeoutButton.onclick = function () {
  let value = timeoutInput.value * 1000; //value is in seconds
  chrome.storage.sync.set({ timeout: value }, function () {
    console.log(`Timeout set: ${value}ms.`);
    message.innerHTML = `Timeout updated to ${value / 1000}s.`;
  });
};
