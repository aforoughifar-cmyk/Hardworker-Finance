import React, { useState } from 'react';
import { Kullanici } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: Kullanici) => void;
  kullanicilar: Kullanici[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, kullanicilar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = kullanicilar.find(k => k.kullaniciAdi === username && k.sifre === password);

    if (user) {
      setError('');
      if (rememberMe) {
        localStorage.setItem('aktifKullanici', JSON.stringify(user));
      } else {
        localStorage.removeItem('aktifKullanici');
      }
      onLoginSuccess(user);
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Yönetim Paneli Girişi</h1>
          <p className="text-slate-500 mt-2">Lütfen devam etmek için giriş yapın.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
                htmlFor="username" 
                className="block text-sm font-medium text-slate-700">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
              placeholder="admin"
            />
          </div>
          <div>
            <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate-700">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="admin"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Beni Hatırla
              </label>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
       <footer className="text-center mt-8 text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} - React & Tailwind ile Oluşturuldu</p>
      </footer>
    </div>
  );
};

export default LoginPage;