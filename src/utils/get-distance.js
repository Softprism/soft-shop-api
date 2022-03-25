import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const getDistance = async (destination, origin) => {
  if (!destination) return { err: "Please enter users destination.", status: 400 };
  if (!origin) return { err: "Please enter users origin.", status: 400 };

  let distance = await client.distancematrix({
    params: {
      origins: [`place_id:${origin}`],
      destinations: [`place_id:${destination}`],
      key: process.env.GOOGLE_MAPS_API_KEY
    },
    timeout: 1000
  });
  if (distance.data.rows[0].elements[0].status === "NOT_FOUND") {
    distance.data.rows[0].elements[0] = {
      duration: {
        text: "Can't resolve"
      }
    };
  }
  return distance.data.rows[0].elements[0].duration.text;
};

export default getDistance;
