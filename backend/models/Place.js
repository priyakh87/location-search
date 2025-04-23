const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  timestamp: String,
});

const favoriteLocationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  name: String,
});

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  locationHistory: [locationHistorySchema],
  favoriteLocations: [favoriteLocationSchema],
});

module.exports = mongoose.model('Place', placeSchema);
