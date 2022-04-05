import * as admin from "firebase-admin";
import softShopDelivery from "../config/softshop-delivery-firebase-adminsdk-dr677-85bbb66755.json";
import softShopOrder from "../config/softshop-order-firebase-adminsdk-yo40z-cfe8665739.json";
import softShopVendor from "../config/softshop-vendor-firebase-adminsdk-67xeq-c609aeb6d4.json";

let sso = admin.initializeApp({
  credential: admin.credential.cert(softShopOrder),
}, "sso");

let ssd = admin.initializeApp({
  credential: admin.credential.cert(softShopDelivery)
}, "ssd");

let ssv = admin.initializeApp({
  credential: admin.credential.cert(softShopVendor)
}, "ssv");

let ssu = admin.initializeApp({
  credential: admin.credential.cert(softShopVendor)
}, "ssu");

const sendOne = async (app, deviceToken, title, body, data) => {
  const message = {
    notification: {
      title,
      body
    },
    data,
    token: deviceToken
  };

  if (app === "sso") {
  // Send a message to devices subscribed to the provided topic.
    let sendPush = await sso.messaging().send(message);
    return sendPush;
  }
  if (app === "ssd") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssd.messaging().send(message);
    return sendPush;
  }
  if (app === "ssv") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssv.messaging().send(message);
    return sendPush;
  }
  if (app === "ssu") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssu.messaging().send(message);
    return sendPush;
  }
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

const sendTopic = async (app, topic, title, body, data) => {
  const message = {
    notification: {
      title,
      body
    },
    data,
    topic
  };
  // Send a message to devices subscribed to the provided topic.
  if (app === "sso") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await sso.messaging().send(message);
    return sendPush;
  }
  if (app === "ssd") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssd.messaging().send(message);
    return sendPush;
  }
  if (app === "ssv") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssv.messaging().send(message);
    return sendPush;
  }
};

export { sendOne, sendMany, sendTopic };
