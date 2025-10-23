import React, { useState, useRef } from 'react';
// FIX: Corrected import path for types
import { UserProfile } from '../types';
import UserIcon from './icons/UserIcon';

interface ProfilePageProps {
    profile: UserProfile;
    onUpdateProfile: (data: Partial<UserProfile>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profilePicture: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    alert('Profil güncellendi!');
  };

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Profilim</h1>
        <p className="text-slate-500 mt-2 text-lg">Kullanıcı bilgilerinizi güncelleyin.</p>
      </header>
      <main className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <UserIcon />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800"
            >
              Resmi Değiştir
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Telefon</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;