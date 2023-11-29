const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/;
const convertToBoolean = (str) => str === "true";

//------------------------------------ dom utils--------------------------------------
function waitForElementToExist(selector, ifNotExists = () => {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    ifNotExists();
    // setTimeout(reject, 30000);
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

const injectContent = () => {
  const middleToolBar = document.querySelector("div.lefKC + div>div");
  if (!middleToolBar) return false;
  const muteButton = middleToolBar.querySelector(
    'button[aria-label~="microphone" i]'
  );

  if (!muteButton) return false;
};

const getMuteButton = () =>
  document.querySelector(
    'div.Tmb7Fd button[data-is-muted][aria-label*="מיקרופון" i],button[data-is-muted][aria-label*="microphone" i]' //להוסיף לשפות אחרות
  );
//------------------------------------ local storage--------------------------------------
async function getParticipantDetailsFromStorage() {
  try {
    return await JSON.parse(localStorage.getItem("Participant") || "{}");
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function saveParticipantDetails(ParticipantDetailsFromDom) {
  try {
    let storageDetails = (await getParticipantDetailsFromStorage()) || {};
    if (!("uuid" in storageDetails)) {
      storageDetails.uuid = crypto.randomUUID();
    }
    storageDetails = { ...storageDetails, ...ParticipantDetailsFromDom };
    await localStorage.setItem("Participant", JSON.stringify(storageDetails));

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

//------------------------------------ participant details--------------------------------------

function simulateMute() {
  const OSName = navigator.appVersion.indexOf("Mac") != -1 ? "MacOS" : "Other";
  if (OSName == "MacOS") {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        metaKey: true,
        keyCode: 68,
        code: "KeyD",
      })
    );
  } else {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        keyCode: 68,
        code: "KeyD",
      })
    );
  }
}

async function extractParticipantDetails() {
  try {
    let participentList = await waitForElementToExist(
      "div.m3Uzve.RJRKn",
      () => {
        document.querySelector('button[data-promo-anchor-id="GEUYHe"]').click();
      }
    );

    let youLabel = await waitForElementToExist(
      "div.m3Uzve.RJRKn div.VfPpkd-aGsRMb span.NnTWjc",
      () => {
        participentList.querySelector('div[role="button"]').click();
      }
    );

    return {
      ParticipantDetails: {
        username: youLabel.previousSibling.textContent,
        googleID: youLabel
          .closest('div[role="listitem"]')
          .getAttribute("data-participant-id"),
      },
      isHost: Boolean(youLabel.parentElement.nextSibling?.textContent),
    };
  } catch (err) {
    alert("This page is corrupted, can you please refresh the page?");
    console.log(err);
    return null;
    //Later when I'll read the username and password from the storage, if I don't find it or it is deleted, I'll show the same message and ask the user to refresh the page. I won't read again, only when the original DOM is loaded to prevent the user from corrupting the DOM and thus the save.
  }
}

function updateMuteButton(hasPermission) {
  const muteButton = getMuteButton();
  muteButton.disabled = !hasPermission;
  if (
    !convertToBoolean(muteButton.getAttribute("data-is-muted")) &&
    !hasPermission
  ) {
    simulateMute();
  }
}

async function checkParticipant() {
  //This function needs to run on 3 different occations: on loading page, on changing speaking and on changing who has permission
  const ParticipantDetails = await getParticipantDetailsFromStorage();
  await chrome.runtime.sendMessage(
    { type: "CHECKPERMISSION", ParticipantDetails },
    (res) => {
      updateMuteButton(res.canSpeak);
    }
  );
}

function setupMuteObserver() {
  const config = {
    subtree: true,
    attributeOldValue: true,
    attributeFilter: ["data-is-muted"],
  };

  const observer = new MutationObserver(async () => {
    await checkParticipant();
  });
  observer.observe(getMuteButton(), config);

  return observer;
}

//-----------------------------------the main function------------------------------------------------------
async function setup() {
  const meetingID = window.location.pathname.match(meetURLRegex);

  const { ParticipantDetails, isHost } = await extractParticipantDetails();
  await saveParticipantDetails(ParticipantDetails);
  await checkParticipant();
  setupMuteObserver();
  // checkParticipant();
}

(async () => {
  try {
    await waitForElementToExist('button[jsname="A5il2e"]');
    await setup();
  } catch (err) {
    console.log("failed");
    console.log(err);
  }

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
})();
