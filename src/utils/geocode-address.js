import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const getGeocode = async (req, res, next) => {
  if (!req.query.place_id) return res.status(400).json({ success: false, msg: "Please enter an address.", status: 400 });

  try {
    let geocode = await client.geocode({
      params: {
        place_id: req.query.place_id,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 1000
    });
    return res.status(200).json({ success: true, result: geocode.data.results[0].geometry, status: 200 });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.response.data.status, status: 400 });
  }
};

export default getGeocode;
