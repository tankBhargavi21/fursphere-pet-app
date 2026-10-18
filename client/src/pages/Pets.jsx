import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Dog, Trash2, Edit3, Heart, ShieldCheck, AlertCircle, X, Check } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Pets() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pet form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [photo, setPhoto] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/pets');
      if (res.success) {
        setPets(res.pets || []);
      }
    } catch (err) {
      console.error('Fetch pets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Login to Manage Your Pets</h2>
        <p className="text-xs text-slate-500">Save and monitor your cats and dogs in your FurSphere family.</p>
        <Link
          to="/login"
          state={{ from: { pathname: '/pets' } }}
          className="inline-block px-5 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold"
        >
          Login
        </Link>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingPetId(null);
    setName('');
    setType('dog');
    setBreed('');
    setAge('');
    setGender('Male');
    setPhoto('');
    setCareNotes('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (pet) => {
    setEditingPetId(pet._id || pet.id);
    setName(pet.name || '');
    setType(pet.type || 'dog');
    setBreed(pet.breed || '');
    setAge(pet.age || '');
    setGender(pet.gender || 'Male');
    setPhoto(pet.photo || '');
    setCareNotes(pet.careNotes || '');
    setError('');
    setShowModal(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your pet’s name.');
      return;
    }

    setSubmitting(true);
    setError('');

    const petPayload = {
      name: name.trim(),
      type,
      breed: breed.trim() || (type === 'dog' ? 'Golden Retriever Mix' : 'Domestic Shorthair'),
      age: age.trim() || '1 year',
      gender,
      photo: photo.trim(),
      careNotes: careNotes.trim(),
    };

    try {
      if (editingPetId) {
        // Update
        const res = await apiFetch(`/pets/${editingPetId}`, {
          method: 'PUT',
          body: JSON.stringify(petPayload),
        });
        if (res.success) {
          setSuccess('Pet profile updated!');
          setShowModal(false);
          fetchPets();
        }
      } else {
        // Add new
        const res = await apiFetch('/pets', {
          method: 'POST',
          body: JSON.stringify(petPayload),
        });
        if (res.success) {
          setSuccess(`${name} added to your FurSphere family!`);
          setShowModal(false);
          fetchPets();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save pet profile.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeletePet = async (id, petName) => {
    if (!window.confirm(`Are you sure you want to remove ${petName} from your profile?`)) return;

    try {
      const res = await apiFetch(`/pets/${id}`, { method: 'DELETE' });
      if (res.success) {
        setPets(pets.filter((p) => (p._id || p.id) !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to remove pet.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Furry Family
            </h1>
            <p className="text-xs text-slate-500">Manage health profiles, dietary notes and ages</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Pet
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Pet Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl h-60 animate-pulse" />
          ))}
        </div>
      ) : pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const petId = pet._id || pet.id;
            return (
              <div
                key={petId}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-2xl bg-slate-100 overflow-hidden mb-3">
                    <img
                      src={
                        pet.photo ||
                        (pet.type === 'cat'
                          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'
                          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500')
                      }
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 shadow-xs uppercase">
                      {pet.type === 'cat' ? '🐱 Cat' : '🐶 Dog'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{pet.name}</h3>
                      <p className="text-xs text-slate-500">{pet.breed}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {pet.age}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>Gender: <strong>{pet.gender}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Vaccinated
                    </span>
                  </div>

                  {pet.careNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-3 line-clamp-2">
                      💡 {pet.careNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(pet)}
                    className="p-2 text-slate-500 hover:text-[#0d5c46] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Pet"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePet(petId, pet.name)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove Pet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0d5c46] flex items-center justify-center mx-auto">
            <Dog className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Pets Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your furry friends to unlock tailored food recommendations and personalized AI veterinary tips!
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold hover:bg-[#0a4837] cursor-pointer"
          >
            Add Your First Pet
          </button>
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPetId ? 'Edit Pet Profile' : 'Add a New Pet'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePet} className="space-y-3">
              {/* Pet Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bruno, Bella, Simba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Type: Cat or Dog */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pet Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('dog')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      type === 'dog'
                        ? 'border-[#0d5c46] bg-emerald-50 text-[#0d5c46]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🐶 Dog
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('cat')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      type === 'cat'
                        ? 'border-[#0d5c46] bg-emerald-50 text-[#0d5c46]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🐱 Cat
                  </button>
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Breed (if known)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Golden Retriever, Persian Cat, Beagle"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 years, 6 months"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/pet.jpg"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Care Information / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Care Information & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Allergic to chicken, loves squeaky chew balls, needs ear cleaning on Sundays"
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0d5c46] hover:bg-[#0a4837] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingPetId ? 'Update Pet' : 'Save Pet'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
