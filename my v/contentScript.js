const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/;

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
  console.log(muteButton);
};
const inMeetingPage = () => Boolean(document.querySelector("div.lefKC"));

async function saveParticipantDetails(currentParticipantDetails) {
  try {
    await chrome.storage.sync.set({
      Participant: currentParticipantDetails,
    });

    return true;
  } catch (err) {
    console.log(err);
    return false;
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
      username: youLabel.previousSibling.textContent,
      password: youLabel
        .closest('div[role="listitem"]')
        .getAttribute("data-participant-id"),
    };
  } catch (err) {
    alert("This page is corrupted, can you please refresh the page?");
    console.log(err);
    return null;
    //Later when I'll read the username and password from the storage, if I don't find it or it is deleted, I'll show the same message and ask the user to refresh the page. I won't read again, only when the original DOM is loaded to prevent the user from corrupting the DOM and thus the save.
  }
}

(async () => {
  console.log("new tab loaded!");
  try {
    await waitForElementToExist('button[jsname="A5il2e"]');
    const meetingID = window.location.pathname.match(meetURLRegex);
    const userDetails = await extractParticipantDetails();
    console.log(await saveParticipantDetails(userDetails));
  } catch {
    console.log("failed");
  }

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
})();
