export const meetURLRegex =
  /https:\/\/meet\.google\.com\/(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})(?<quary>.*)/;

waitForElementToExist = (selector, ifNotExists = () => {}) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    ifNotExists();
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
};
