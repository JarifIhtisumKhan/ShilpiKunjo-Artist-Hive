import React, { useState } from 'react';
import { Palette, Lock, User, ArrowRight, UserCheck, Shield, Mail, Sparkles } from 'lucide-react';

function FloatingInput({ id, type = 'text', label, value, onChange, required = true }) {
  return (
    <div className="relative group">
      <input
        type={type}
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-950 focus:outline-none focus:border-[#315812] focus:ring-1 focus:ring-[#315812]/50 transition-all duration-300"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-xs text-gray-700 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-[#315812] font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-800"
      >
        {label}
      </label>
    </div>
  );
}

export default function LoginModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state
  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid login credentials');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (uname, pass) => {
    setUsername(uname);
    setPassword(pass);
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          role: 'artist'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#c6ae82]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#ab946a] shadow-2xl relative overflow-hidden">
        {/* Top Mini Illustration Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-32 w-full border border-stone-600 shadow-md">
          <img
            src="/koi_pond_bg.jpg"
            alt="Zen Koi Pond"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stone-800/90 border border-stone-600 p-1 flex items-center justify-center shadow-lg">
                <Palette className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-none drop-shadow">
                  ShilpiKunjo
                </h2>
                <span className="text-[10px] text-stone-300 font-medium">Artist Hive Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-800 text-xs text-center font-bold animate-fadeIn">
            {error}
          </div>
        )}

        {/* Segmented Sliding Tab Control */}
        <div className="relative flex bg-stone-800 p-1.5 rounded-2xl border border-stone-600 mb-6 text-xs font-semibold shadow-inner">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-b from-stone-600 to-stone-900 rounded-xl transition-all duration-300 ease-out border border-stone-500/50 shadow-md ${
              mode === 'register' ? 'left-[calc(50%+3px)]' : 'left-1.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'login' ? 'text-white drop-shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'register' ? 'text-white drop-shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <FloatingInput
              id="login-username"
              type="text"
              label="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FloatingInput
              id="login-password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Stone-Colored Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-stone w-full py-3.5 text-stone-100 font-bold text-xs rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo Fill Credentials (Stone Button Badges) */}
            <div className="pt-3 border-t border-[#ab946a] mt-4">
              <p className="text-[11px] text-gray-800 mb-2 font-bold text-center">
                Demo Credentials (Password: <code className="text-stone-800 font-mono font-bold bg-stone-300 px-1.5 py-0.5 rounded">password123</code>)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('jarif', 'password123')}
                  className="btn-stone-secondary flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Jarif
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('fairuz', 'password123')}
                  className="btn-stone-secondary flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Fairuz
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('rudila', 'password123')}
                  className="btn-stone-secondary flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Rudila
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('rubab_sazda', 'password123')}
                  className="btn-stone-secondary flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Rubab
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'password123')}
                  className="btn-stone col-span-2 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-200"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin (@admin)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <FloatingInput
              id="reg-name"
              type="text"
              label="Full Name"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                id="reg-username"
                type="text"
                label="Username"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
              />

              <FloatingInput
                id="reg-email"
                type="email"
                label="Email"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>

            <FloatingInput
              id="reg-password"
              type="password"
              label="Password"
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
            />

            {/* Stone-Colored Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-stone w-full py-3.5 text-stone-100 font-bold text-xs rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
