const spreakingParticipant = {
  uuid: "8f288464-21a3-44ea-9192-b897c5264159",
};
const hostParticipant = {
  uuid: "19dd76a3-dd03-4f19-90e7-9d72d59a20b2",
};
function canParticipantSpeak(ParticipantDetails) {
  console.log(ParticipantDetails);
  return (
    ParticipantDetails.uuid == spreakingParticipant.uuid ||
    ParticipantDetails.uuid == hostParticipant.uuid
  );
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.type) {
    case "CHECKPERMISSION":
      console.log(canParticipantSpeak(message.ParticipantDetails));
      sendResponse({
        canSpeak: canParticipantSpeak(message.ParticipantDetails),
      });
      break;
  }
  console.log("background: onMessage", message);
});
