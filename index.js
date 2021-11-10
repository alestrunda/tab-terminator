const timeoutButton = document.getElementById("timeoutButton");
const timeoutInput = document.getElementById("timeoutInput");
const message = document.getElementById("message");

chrome.storage.sync.get(["timeout"], function (res) {
  timeoutInput.value = toSeconds(res.timeout);
});

timeoutButton.onclick = function () {
  const timeout = toMilliseconds(timeoutInput.value);

  chrome.storage.sync.set({ timeout }, function () {
    console.log(`Timeout set: ${timeout}ms.`);
    message.innerHTML = `Timeout updated to ${toSeconds(timeout)}s.`;
  });
};

function toSeconds(milliseconds) {
  return milliseconds / 1000;
}

function toMilliseconds(seconds) {
  return seconds * 1000;
}
