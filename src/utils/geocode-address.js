import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const getGeocode = async (req, res, next) => {
  let geoCodeParams = {};
  if (req.query.place_id && req.query.latlng) {
    return res.status(400).json({ success: false, msg: "You can only use this endpoint to geocode or reverse geocode dear.", status: 400 });
  }
  if (!req.query.place_id && !req.query.latlng) {
    return res.status(400).json({ success: false, msg: "Please enter either a place_id or latlng value for this request.", status: 400 });
  }
  if (req.query.place_id) {
    geoCodeParams.place_id = req.query.place_id;
    geoCodeParams.key = process.env.GOOGLE_MAPS_API_KEY;
  }
  if (req.query.latlng) {
    geoCodeParams.latlng = req.query.latlng;
    geoCodeParams.type = "street_address";
    geoCodeParams.key = process.env.GOOGLE_MAPS_API_KEY;
  }

  try {
    let geocode = await client.geocode({
      params: {
        ...geoCodeParams
      },
      timeout: 100000
    });
    if (req.query.place_id) {
      return res.status(200).json({ success: true, result: geocode.data.results[0].geometry.location, status: 200 });
    }
    if (req.query.latlng) {
      return res.status(200).json({
        success: true,
        result: {
          address: geocode.data.results[0].formatted_address,
          place_id: geocode.data.results[0].place_id
        },
        status: 200
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.response.data.status, status: 400 });
  }
};

export default getGeocode;
