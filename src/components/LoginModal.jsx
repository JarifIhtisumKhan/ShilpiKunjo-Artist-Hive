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
    <div className="min-h-[88vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#c6ae82] rounded-3xl p-8 border border-[#ab946a] shadow-2xl relative overflow-hidden">
        {/* Glow decorative background */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#aca04d]/10 rounded-full blur-3xl -z-10"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#aca04d] via-[#748729] to-[#315812] p-0.5 shadow-xl shadow-[#315812]/20 mx-auto mb-3 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#F3E3C5] rounded-[14px] flex items-center justify-center">
              <Palette className="w-7 h-7 text-[#315812]" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
            ShilpiKunjo
          </h2>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Segmented Sliding Tab Control */}
        <div className="relative flex bg-[#b8a074] p-1.5 rounded-2xl border border-[#9d865c] mb-6 text-xs font-semibold">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#aca04d] to-[#315812] rounded-xl transition-all duration-300 ease-out shadow-md ${
              mode === 'register' ? 'left-[calc(50%+3px)]' : 'left-1.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'login' ? 'text-white' : 'text-gray-800 hover:text-gray-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`relative z-10 flex-1 py-2.5 text-center transition-colors duration-200 font-bold ${
              mode === 'register' ? 'text-white' : 'text-gray-800 hover:text-gray-950'
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#aca04d] via-[#748729] to-[#315812] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#315812]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google-style Demo Fill Credentials */}
            <div className="pt-3 border-t border-[#ab946a] mt-4">
              <p className="text-[11px] text-gray-800 mb-2 font-medium text-center">
                Demo Credentials (Password: <code className="text-[#315812] font-mono font-bold">password123</code>)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('jarif', 'password123')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#b8a074] border border-[#9d865c] rounded-xl text-xs font-bold text-[#315812] hover:bg-[#aca04d]/20 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Jarif
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('fairuz', 'password123')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#b8a074] border border-[#9d865c] rounded-xl text-xs font-bold text-[#315812] hover:bg-[#aca04d]/20 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Fairuz
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('rudila', 'password123')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#b8a074] border border-[#9d865c] rounded-xl text-xs font-bold text-[#315812] hover:bg-[#aca04d]/20 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Rudila
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('rubab_sazda', 'password123')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#b8a074] border border-[#9d865c] rounded-xl text-xs font-bold text-[#315812] hover:bg-[#aca04d]/20 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Rubab
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'password123')}
                  className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#b8a074] border border-[#9d865c] rounded-xl text-xs font-bold text-rose-800 hover:bg-rose-500/10 transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#aca04d] via-[#748729] to-[#315812] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#315812]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
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
