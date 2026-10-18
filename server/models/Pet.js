import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['cat', 'dog'], required: true },
  breed: { type: String, default: 'Mixed Breed' },
  age: { type: String, default: '1 year' },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  photo: { type: String, default: '' },
  careNotes: { type: String, default: '' },
  vaccinated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

petSchema.index({ userId: 1 });

export default mongoose.models.Pet || mongoose.model('Pet', petSchema);
