import React, { useState } from 'react';
import { Palette, Lock, User, ArrowRight, UserCheck, Shield, Mail, Sparkles, Heart } from 'lucide-react';

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
        className="peer w-full bg-[#091a17]/90 border border-emerald-500/25 focus:border-pink-400 rounded-2xl px-4 pt-5 pb-2 text-xs text-emerald-50 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 placeholder-transparent shadow-inner"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-xs text-emerald-300/60 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-pink-300 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-emerald-200"
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
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md glass-panel-cute rounded-3xl p-8 border border-pink-300/30 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        
        {/* Glow decorative background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>

        {/* Cute Floating Sanctuary Pill */}
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-950/70 border border-teal-400/30 text-[11px] font-semibold text-teal-200 shadow-sm font-comic">
            <span>🎨</span> Creative Dream Sanctuary <span>✨</span>
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400 via-teal-300 to-amber-300 p-0.5 shadow-xl shadow-pink-500/25 mx-auto mb-3 hover:scale-105 hover:rotate-3 transition-transform duration-300">
            <div className="w-full h-full bg-[#082025] rounded-[14px] flex items-center justify-center">
              <Palette className="w-8 h-8 text-pink-300" />
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-rustic font-normal tracking-wide text-white flex items-center justify-center gap-2 drop-shadow-md">
            <span>ShilpiKunjo</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </h2>
          <p className="text-xs text-teal-200/80 mt-1 font-comic">
            Where creative imagination meets vibrant visual art ✨
          </p>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Segmented Sliding Tab Control */}
        <div className="relative flex bg-[#071714]/80 p-1.5 rounded-2xl border border-emerald-500/30 mb-6 text-xs font-semibold shadow-inner">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 rounded-xl transition-all duration-300 ease-out shadow-md ${
              mode === 'register' ? 'left-[calc(50%+3px)]' : 'left-1.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'login' ? 'text-gray-950 font-extrabold' : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            Sign In 🌿
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'register' ? 'text-gray-950 font-extrabold' : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            Create Account ✨
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Entering Sanctuary...' : 'Sign In to ShilpiKunjo'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google-style Demo Fill Credentials */}
            <div className="pt-5 border-t border-emerald-500/20 mt-6">
              <span className="block text-[11px] text-emerald-200/70 font-medium text-center mb-3">
                Quick Demo Login (Password: <code className="text-pink-300 font-mono font-bold">password123</code>)
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('jarif', 'password123')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e1b] border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-200 hover:border-pink-400/50 hover:bg-[#11312c] transition-all shadow-sm"
                >
                  <span>🎏</span>
                  Jarif
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('fairuz', 'password123')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e1b] border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-200 hover:border-pink-400/50 hover:bg-[#11312c] transition-all shadow-sm"
                >
                  <span>🌸</span>
                  Fairuz
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('rudila', 'password123')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e1b] border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-200 hover:border-pink-400/50 hover:bg-[#11312c] transition-all shadow-sm"
                >
                  <span>✨</span>
                  Rudila
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('rubab_sazda', 'password123')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e1b] border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-200 hover:border-pink-400/50 hover:bg-[#11312c] transition-all shadow-sm"
                >
                  <span>🎨</span>
                  Rubab
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'password123')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e1b] border border-red-400/30 rounded-xl text-xs font-bold text-rose-300 hover:border-red-400/60 hover:bg-[#11312c] transition-all shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating...' : 'Join the Hive ✨'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

