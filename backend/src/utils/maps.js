const directionsUrl = (lat, lng) => {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

const embedUrl = (lat, lng, apiKey) => {
  if (lat == null || lng == null) return null;
  if (!apiKey) {
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  }
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;
};

module.exports = { directionsUrl, embedUrl };
