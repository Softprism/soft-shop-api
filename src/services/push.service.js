import admin from "firebase-admin";

const sendOne = async (deviceToken, title, body, data) => {
  const message = {
    notification: {
      title,
      body
    },
    data,
    token: deviceToken
  };
  // Send a message to devices subscribed to the provided topic.
  let sendPush = await admin.messaging().send(message);
  return sendPush;
};

const sendMany = async (deviceTokens, title, body, data) => {
  const message = {
    notification: {
      title,
      body
    },
    data,
    token: deviceTokens
  };
  // Send a message to devices subscribed to the provided topic.
  let sendPush = await admin.messaging().sendMulticast(message);
  return sendPush;
};

const sendTopic = async (topic, title, body, data) => {
  const message = {
    notification: {
      title,
      body
    },
    data,
    topic
  };
  // Send a message to devices subscribed to the provided topic.
  let sendPush = await admin.messaging().send(message);
  return sendPush;
};

export { sendOne, sendMany, sendTopic };
