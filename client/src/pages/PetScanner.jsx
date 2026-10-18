import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, UploadCloud, X, RefreshCw, Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function PetScanner() {
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Sample demo pet images for instant testing without uploading
  const samplePets = [
    { label: 'Golden Retriever', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600' },
    { label: 'Tabby Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
    { label: 'Puppy', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 10MB.');
      return;
    }

    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (url) => {
    try {
      setError('');
      setSelectedImage(url);
      setAnalysisResult(null);

      // Convert sample URL to a Blob/File so it can be uploaded to backend
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'sample-pet.jpg', { type: 'image/jpeg' });
      setImageFile(file);
    } catch (err) {
      console.warn('Sample load error:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile && !selectedImage) {
      setError('Please select or upload a pet photo first.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('photo', imageFile);
      } else {
        // Fallback fetch if sample URL was selected directly
        const blob = await (await fetch(selectedImage)).blob();
        formData.append('photo', blob, 'pet-photo.jpg');
      }

      const res = await apiFetch('/ai/scan-photo', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try another clear pet photograph.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Header matching Panel 6 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pet Photo Scanner
          </h1>
          <p className="text-xs text-slate-400">AI-Powered Visual Care & Demeanor Check</p>
        </div>
      </div>

      {/* Hero Pet Image & Tagline (Matches Panel 6) */}
      <div className="text-center space-y-2">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-emerald-200 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80"
            alt="Pet Scanner Mascot"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Scan Your Pet's Photo
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Get AI-powered insights about your pet's health, coat condition, and wellness care tips.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box (Matches Panel 6 dotted box with camera icon) */}
      {!selectedImage ? (
        <div className="space-y-4">
          <label className="block w-full border-2 border-dashed border-emerald-300 hover:border-[#0d5c46] bg-emerald-50/30 hover:bg-emerald-50/50 rounded-3xl p-8 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-white text-[#0d5c46] shadow-sm flex items-center justify-center mx-auto mb-3">
              <Camera className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Upload Photo</h3>
            <p className="text-xs text-slate-400 mt-0.5">or take a photo with camera</p>
            <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-semibold">
              Supports JPG, PNG, WebP (Max 10MB)
            </span>
          </label>

          {/* Quick Demo Samples */}
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-2 text-center">
              Or tap a sample pet photo to test:
            </span>
            <div className="flex justify-center gap-3">
              {samplePets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(p.url)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-all"
                >
                  <img src={p.url} alt={p.label} className="w-6 h-6 rounded-full object-cover" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Box with Replace / Remove controls */
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[4/3] bg-slate-100 flex items-center justify-center max-h-72">
            <img
              src={selectedImage}
              alt="Selected Pet"
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer transition-colors"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <label className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center cursor-pointer transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              Replace Photo
            </label>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Analyze Photo Button (Matches Panel 6) */}
      {selectedImage && !analysisResult && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-4 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing Pet Features with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Photo
            </>
          )}
        </button>
      )}

      {/* AI Analysis Results Card */}
      {analysisResult && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#0d5c46] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI Health & Demeanor Observations
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
            {analysisResult}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Veterinary Disclaimer:</strong> This visual analysis is for pet wellness reference only. Always consult your veterinarian for official diagnoses or medical prescriptions.
            </span>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Scan Another Pet Photo
          </button>
        </div>
      )}

    </div>
  );
}
