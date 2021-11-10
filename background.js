const DEFAULT_TIMEOUT = 1200000; //20 minutes

// set default timeout
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get(["timeout"], function (res) {
    if (!res.timeout) {
      chrome.storage.sync.set({ timeout: DEFAULT_TIMEOUT }, function () {
        console.log(`Default timeout set: ${DEFAULT_TIMEOUT}ms.`);
      });
    }
  });
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.storage.sync.get(
    ["lastActiveTabID", "tabTimeouts", "timeout"],
    function (res) {
      //clear timeout if current tab reactivated
      const currentTabTimeout = res.tabTimeouts && res.tabTimeouts[info.tabId];
      if (currentTabTimeout) {
        clearTimeout(currentTabTimeout);
        console.log(`Tab ${info.tabId} reactivated, removing also timeout.`);
      }

      if (!res.lastActiveTabID) return;
      //set timeout for the last active tab
      const lastActiveTabTimeout = setTabTimeout(
        res.lastActiveTabID,
        res.timeout
      );
      chrome.storage.sync.set(
        {
          tabTimeouts: {
            ...res.tabTimeouts,
            [res.lastActiveTabID]: lastActiveTabTimeout,
          },
        },
        function () {
          console.log(`Tab timeouts updated.`);
        }
      );
    }
  );

  //store last tab id, so we can set a timeout when another tab has been activated
  chrome.storage.sync.set({ lastActiveTabID: info.tabId }, function () {
    console.log(`Last tab ID set: ${info.tabId}.`);
  });
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  chrome.storage.sync.get(["lastActiveTabID", "tabTimeouts"], function (res) {
    //reset lastActiveTabID if such tab has just been closed
    if (res.lastActiveTabID === tabId) {
      chrome.storage.sync.set({ lastActiveTabID: undefined }, function () {
        console.log(`Tab ${tabId} removed, clearing the lastActiveTabID.`);
      });
    }

    //clear timeout for the closed tab
    const closedTabTimeout = res.tabTimeouts && res.tabTimeouts[tabId];
    if (!closedTabTimeout) return;
    clearTimeout(closedTabTimeout);
    console.log(`Tab ${tabId} removed, removing also timeout.`);
  });
});

function setTabTimeout(tabID, timeout) {
  console.log(`Setting timeout ${timeout}ms for ${tabID}.`);
  return setTimeout(function () {
    chrome.tabs.query({}, function (tabs) {
      const tabToClose = tabs.find((tab) => tab.id === tabID);
      if (tabToClose) {
        chrome.tabs.remove(tabID, function () {
          console.log(`Tab ${tabID} closed after ${timeout}ms.`);
        });
      }
    });
  }, timeout);
}
