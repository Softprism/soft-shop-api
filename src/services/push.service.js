import * as admin from "firebase-admin";
import softShopDelivery from "../config/softshop-delivery-firebase-adminsdk-dr677-85bbb66755.json";
import softShopOrder from "../config/softshop-order-firebase-adminsdk-yo40z-cfe8665739.json";
import softShopVendor from "../config/softshop-vendor-firebase-adminsdk-67xeq-c609aeb6d4.json";

import softShopApps from "../config/softshop-apps-firebase-adminsdk-jwhk3-bdc0078feb.json";
import Rider from "../models/rider.model";

import { createLog } from "./logs.service";

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

let ssa = admin.initializeApp({
  credential: admin.credential.cert(softShopApps)
}, "ssa");

const sendOne = async (app, deviceToken, title, body, data) => {
  console.log("sending one", app, deviceToken, title, body, data);
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token: deviceToken
    };
    if (app === "ssa") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await ssa.messaging().send(message);
      return sendPush;
    }
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
  } catch (error) {
    await createLog("send_notification failed", "server", error.message);
  }
};

const sendMany = async (app, deviceTokens, title, body, data) => {
  console.log("sending many", app, deviceTokens, title, body, data);
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: deviceTokens
    };
    if (app === "ssa") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await ssa.messaging().sendMulticast(message);
      return sendPush;
    }
    if (app === "sso") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await sso.messaging().sendMulticast(message);
      return sendPush;
    }
    if (app === "ssd") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await ssd.messaging().sendMulticast(message);
      return sendPush;
    }
    if (app === "ssv") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await ssv.messaging().sendMulticast(message);
      return sendPush;
    }
    if (app === "ssu") {
      // Send a message to devices subscribed to the provided topic.
      let sendPush = await ssu.messaging().sendMulticast(message);
      return sendPush;
    }
  } catch (error) {
    await createLog("send_bulk_notification failed", "server", error.message);
  }
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
  if (app === "ssa") {
    // Send a message to devices subscribed to the provided topic.
    let sendPush = await ssa.messaging().send(message);
    return sendPush;
  }
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

const sendPushToNearbyRiders = async (newDelivery) => {
  try {
    // find riders close to delivery location and send a push notifiction to the delivery app
    let long = parseFloat(newDelivery.location.coordinates[0]);
    let lat = parseFloat(newDelivery.location.coordinates[1]);
    let radian = parseFloat(10 / 6378.1);
    console.log(`searching for riders... long:  ${long}, " lat: ${lat}, radian: ${radian}`);
    const riders = await Rider.find({
      location: {
        $geoWithin: {
          $centerSphere: [[long, lat], radian]
        }
      }
    });
    if (riders.length > 0) {
      console.log(`found ${riders.length} riders`);
      let ridersToken = await Promise.all(riders.map(async (rider) => {
        return rider.pushDeviceToken;
      }));
      let title = "New Delivery";
      let body = `${newDelivery.receiver} has requested a delivery from ${store.name}.`;
      // send push notification to riders
      await sendMany("ssa", ridersToken, title, body);
      return "success";
    }
    console.log("no riders found, creating log...");
    await createLog("find_riders_for_delivery", "store", `can't find any riders for delivery requested by  ${store.name} for ${user.first_name} ${user.last_name}`);
    console.log("no riders found, creating log... Done!");

    return "no_rider_available";
  } catch (error) {
    await createLog("send_push_to_nearby_riders", "server", error.message);
    return "error";
  }
};

export {
  sendOne, sendMany, sendTopic, sendPushToNearbyRiders
};
