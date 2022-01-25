import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const getAddresses = async (req, res, next) => {
  if (!req.query.input) return res.status(400).json({ success: false, msg: "Please enter an address.", status: 400 });
  if (!req.query.accepted_location) return res.status(400).json({ success: false, msg: "Please enter location coordinate.", status: 400 });
  if (!req.query.radius) return res.status(400).json({ success: false, msg: "Please enter a radius in miles.", status: 400 });

  try {
    let addresses = await client.placeAutocomplete({
      params: {
        input: req.query.input,
        components: ["country:ng"],
        location: req.query.accepted_location,
        radius: req.query.radius,
        strictbounds: true,
        types: "geocode",
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 1000
    });
    return res.status(200).json({ success: true, result: addresses.data.predictions, status: 200 });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.response.data.status, status: 400 });
  }
};

export default getAddresses;
