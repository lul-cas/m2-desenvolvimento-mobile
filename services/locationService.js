import * as Location from "expo-location";

export const getReadableLocation = async (lat, lng) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (addresses.length > 0) {
      const addr = addresses[0];
      const city = addr.city || addr.subregion || "";
      const state = addr.region || "";
      return `${city} - ${state}`.trim();
    }

    return "Localização desconhecida";
  } catch (error) {
    console.error("Erro ao converter localização:", error);
    return "Localização indisponível";
  }
};
