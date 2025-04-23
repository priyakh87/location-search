const express = require('express');
const Place = require('../models/Place');
const router = express.Router();

// Get all places
router.get('/', async (req, res) => {
  const places = await Place.find();
  res.json(places);
});

// Get a single place by ID
router.get('/:id', async (req, res) => {
  const place = await Place.findById(req.params.id);
  res.json(place);
});

// Add a new place
router.post('/', async (req, res) => {
  const place = new Place(req.body);
  await place.save();
  res.status(201).json(place);
});

// Add a location history entry
router.post('/:id/locationHistory', async (req, res) => {
  const place = await Place.findById(req.params.id);
  place.locationHistory.push(req.body);
  await place.save();
  res.status(201).json(place);
});

// Add a favorite location
router.post('/:id/favoriteLocations', async (req, res) => {
  const place = await Place.findById(req.params.id);
  place.favoriteLocations.push(req.body);
  await place.save();
  res.status(201).json(place);
});

// Delete a favorite location
router.delete('/:id/favoriteLocations/:favoriteId', async (req, res) => {
  const place = await Place.findById(req.params.id);
  place.favoriteLocations = place.favoriteLocations.filter(
    (fav) => fav._id.toString() !== req.params.favoriteId
  );
  await place.save();
  res.status(200).json(place);
});

module.exports = router;
