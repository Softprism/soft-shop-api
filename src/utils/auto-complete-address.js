import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const getAddresses = async (req, res, next) => {
  console.log(req.query);
  if (!req.query.location) res.status(400).json({ success: false, msg: "Please enter an address.", status: 400 });
  let addresses = await client.placeAutocomplete({
    params: {
      input: req.query.location,
      key: process.env.GOOGLE_MAPS_API_KEY
    },
    timeout: 1000
  });

  return res.status(200).json({ success: true, result: addresses.data, status: 200 });
};

export default getAddresses;
