import express from 'express';
import Pet from '../models/Pet.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pets - Get all pets of authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const pets = await Pet.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: pets.length, pets });
    } else {
      const allPets = LocalStore.get('pets') || [];
      const userPets = allPets.filter((p) => p.userId === userId);
      return res.json({ success: true, count: userPets.length, pets: userPets });
    }
  } catch (error) {
    console.error('Fetch pets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve pets.' });
  }
});

// POST /api/pets - Add new pet
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { name, type, breed, age, gender, photo, careNotes, vaccinated } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Pet name and pet type (cat/dog) are required.' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const newPet = await Pet.create({
        userId,
        name,
        type: type.toLowerCase(),
        breed: breed || 'Mixed Breed',
        age: age || '1 year',
        gender: gender || 'Unknown',
        photo: photo || (type.toLowerCase() === 'cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'),
        careNotes: careNotes || '',
        vaccinated: vaccinated !== undefined ? Boolean(vaccinated) : true,
      });

      return res.status(201).json({ success: true, message: `${name} has been added to your FurSphere family!`, pet: newPet });
    } else {
      const defaultPhoto = type.toLowerCase() === 'cat' 
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' 
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400';

      const newPet = {
        _id: 'pet_' + Date.now(),
        userId,
        name,
        type: type.toLowerCase(),
        breed: breed || 'Mixed Breed',
        age: age || '1 year',
        gender: gender || 'Unknown',
        photo: photo || defaultPhoto,
        careNotes: careNotes || '',
        vaccinated: vaccinated !== undefined ? Boolean(vaccinated) : true,
        createdAt: new Date().toISOString(),
      };

      LocalStore.update((data) => {
        data.pets = data.pets || [];
        data.pets.unshift(newPet);
        return data;
      });

      return res.status(201).json({ success: true, message: `${name} has been added to your FurSphere family!`, pet: newPet });
    }
  } catch (error) {
    console.error('Add pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to add pet.' });
  }
});

// PUT /api/pets/:id - Update pet
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;
    const { name, type, breed, age, gender, photo, careNotes, vaccinated } = req.body;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const pet = await Pet.findOne({ _id: id, userId });
      if (!pet) return res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });

      if (name) pet.name = name;
      if (type) pet.type = type.toLowerCase();
      if (breed) pet.breed = breed;
      if (age) pet.age = age;
      if (gender) pet.gender = gender;
      if (photo !== undefined) pet.photo = photo;
      if (careNotes !== undefined) pet.careNotes = careNotes;
      if (vaccinated !== undefined) pet.vaccinated = Boolean(vaccinated);

      await pet.save();
      return res.json({ success: true, message: 'Pet details updated.', pet });
    } else {
      let updatedPet = null;
      LocalStore.update((data) => {
        const pet = (data.pets || []).find((p) => p._id === id && p.userId === userId);
        if (pet) {
          if (name) pet.name = name;
          if (type) pet.type = type.toLowerCase();
          if (breed) pet.breed = breed;
          if (age) pet.age = age;
          if (gender) pet.gender = gender;
          if (photo !== undefined) pet.photo = photo;
          if (careNotes !== undefined) pet.careNotes = careNotes;
          if (vaccinated !== undefined) pet.vaccinated = Boolean(vaccinated);
          updatedPet = pet;
        }
        return data;
      });

      if (!updatedPet) return res.status(404).json({ success: false, message: 'Pet not found.' });
      return res.json({ success: true, message: 'Pet details updated.', pet: updatedPet });
    }
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pet.' });
  }
});

// DELETE /api/pets/:id - Delete pet
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const deleted = await Pet.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return res.json({ success: true, message: 'Pet removed successfully.' });
    } else {
      let found = false;
      LocalStore.update((data) => {
        const initialLen = (data.pets || []).length;
        data.pets = (data.pets || []).filter((p) => !(p._id === id && p.userId === userId));
        if (data.pets.length < initialLen) found = true;
        return data;
      });

      if (!found) return res.status(404).json({ success: false, message: 'Pet not found.' });
      return res.json({ success: true, message: 'Pet removed successfully.' });
    }
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove pet.' });
  }
});

export default router;
