import nodeGeoCoder, { Options } from 'node-geocoder';
import { Location } from '../schema/location.schema';

export default class LocationUtils {
  static async getRestaurantGeoLocation(address) {
    try {
      const options: Options = {
        provider: 'geocodio',
        apiKey: process.env.GEOCODER_API_KEY,
        formatter: null,
      };

      const geoCoder = nodeGeoCoder(options);

      const loc = await geoCoder.geocode(address);

      const location: Location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
      };

      return location;
    } catch (error) {
      console.log(error.message);
    }
  }
}
