'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();

  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = (() => { try { return localStorage.getItem('zivelo-dark') === '1'; } catch { return false; } })();
    if (saved) { setDark(true); document.documentElement.classList.add('dark'); document.body.classList.add('dark'); }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('zivelo-dark', dark ? '1' : '0'); } catch {}
  }, [dark]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('zivelo-remember-email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (remember) localStorage.setItem('zivelo-remember-email', email);
      else localStorage.removeItem('zivelo-remember-email');
    } catch {}

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT: form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-8 lg:py-10 relative">
        <header className="flex items-center justify-between mb-12 fade-up">
          <a href="/login" className="flex items-center gap-2">
            <img src="/logos/zivelo-full-dark.svg"  alt="Zivelo" className="block dark:hidden h-9 w-auto"/>
            <img src="/logos/zivelo-full-white.svg" alt="Zivelo" className="hidden dark:block h-9 w-auto"/>
          </a>
          <button
            onClick={() => setDark(d => !d)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line bg-white hover:border-zred transition-colors"
            title="Cambiar tema"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={dark ? 'hidden' : ''}>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
            </svg>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={!dark ? 'hidden' : ''}>
              <circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>
            </svg>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[420px]">
            <div className="mb-9 fade-up delay-1">
              <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-tint mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-zred"></span>
                <span className="text-[11.5px] font-semibold text-zred tracking-wider uppercase">Workspace privado</span>
              </div>
              <h1 className="text-[36px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mb-3" style={{ letterSpacing: '-0.03em' }}>
                Bienvenido de vuelta
              </h1>
              <p className="text-[15px] text-muted leading-relaxed">
                Ingresa con tu cuenta corporativa de Zivelo. El registro está deshabilitado por seguridad — solicita una invitación al administrador.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 fade-up delay-2" autoComplete="on">
              <label className="block">
                <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">Email corporativo</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-semibold text-carbon uppercase tracking-wider">Contraseña</span>
                  <a href="#" className="text-[12px] font-semibold text-zred hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-soft inline-flex items-center justify-center text-muted"
                  >
                    {!showPassword ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18M10.6 6.1A11 11 0 0 1 23 12s-1.4 2.5-4 4.7M6.1 6.1C2.9 8 1 12 1 12s4 7 11 7c2 0 3.8-.6 5.3-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="peer sr-only"/>
                <span className="w-5 h-5 rounded border border-line bg-white inline-flex items-center justify-center peer-checked:bg-zred peer-checked:border-zred transition-colors">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100">
                    <path d="m4 12 5 5L20 6"/>
                  </svg>
                </span>
                <span className="text-[13px] text-carbon">Recordarme en este dispositivo</span>
              </label>

              {error && (
                <div className="rounded-md bg-tint border border-zred/15 px-4 py-3 text-[13px] text-zred font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-press w-full h-12 rounded-full bg-zred text-white font-semibold text-[14px] hover:shadow-red transition-[box-shadow,transform] inline-flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <span>{loading ? 'Verificando...' : 'Iniciar sesión'}</span>
                {loading ? (
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 1-9 9"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 fade-up delay-3">
              <div className="flex-1 h-px bg-line"></div>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">o continúa con</span>
              <div className="flex-1 h-px bg-line"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 fade-up delay-3">
              <button className="btn-press h-11 rounded-full border border-line bg-white hover:border-zred/40 hover:bg-soft transition-colors inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h6c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.7 3.2-7.8z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.2v2.8C4 20.7 7.7 23 12 23z"/><path fill="#FBBC05" d="M6 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.7.4-2.4V6.8H2.2C1.4 8.4 1 10.1 1 12s.4 3.6 1.2 5.2L6 14.4z"/><path fill="#EA4335" d="M12 5.6c1.6 0 3 .5 4.1 1.6L19.3 4C17.4 2.3 14.9 1.2 12 1.2 7.7 1.2 4 3.5 2.2 6.8L6 9.6c.9-2.5 3.2-4.4 6-4.4z"/></svg>
                Google
              </button>
              <button className="btn-press h-11 rounded-full border border-line bg-white hover:border-zred/40 hover:bg-soft transition-colors inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>
                GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-[12.5px] text-muted fade-up delay-3">
              ¿No tienes cuenta?{' '}
              <span className="text-carbon font-medium">Solicita una invitación a un administrador</span>
            </p>
          </div>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-muted fade-up delay-3">
          <div>© 2026 Zivelo · Workspace interno</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-carbon">Soporte</a>
            <a href="#" className="hover:text-carbon">Privacidad</a>
            <a href="#" className="hover:text-carbon">Estado del sistema</a>
          </div>
        </footer>
      </div>

      {/* RIGHT: brand panel */}
      <aside className="hidden lg:flex flex-1 max-w-[640px] relative overflow-hidden" style={{ background: '#1D1D1B', color: '#fff' }}>
        <div className="absolute inset-0 grid-bg opacity-[0.05]"></div>
        <div className="absolute -right-32 -top-32 w-[480px] h-[480px] rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(215,34,40,0.45), transparent 60%)', filter: 'blur(20px)' }}></div>
        <div className="absolute -left-20 bottom-0 w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(215,34,40,0.18), transparent 65%)', filter: 'blur(40px)' }}></div>

        <img src="/logos/zivelo-compact-white.svg" alt="" className="absolute top-10 left-12 h-10 w-auto opacity-90 z-10"/>

        <div className="absolute top-[14%] right-[8%] float-1">
          <div className="bg-white text-carbon rounded-lg shadow-pop p-4 w-[260px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zred"></span>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Café Bruma · Web</span>
            </div>
            <div className="font-bold text-[13.5px] mb-3 leading-snug">Hero + sección de menú con animaciones</div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-carbon text-white ring-2 ring-white dark:ring-[#1D1D1B] flex items-center justify-center text-[9px] font-bold">ML</div>
                <div className="w-6 h-6 rounded-full bg-zred text-white ring-2 ring-white dark:ring-[#1D1D1B] flex items-center justify-center text-[9px] font-bold">RM</div>
              </div>
              <span className="text-[10.5px] font-bold nums px-1.5 py-0.5 rounded bg-tint text-zred">3 días</span>
            </div>
          </div>
        </div>

        <div className="absolute top-[40%] right-[24%] float-2">
          <div className="bg-white text-carbon rounded-lg shadow-pop p-3.5 w-[240px]">
            <div className="text-[10.5px] font-semibold text-muted uppercase tracking-wider mb-2">Progreso · Andamio MX</div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-[24px] font-extrabold nums leading-none">88<span className="text-[14px] text-muted">%</span></span>
              <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-[#E6F4EA] text-[#1E6B3C]">En revisión</span>
            </div>
            <div className="h-1.5 bg-soft rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '88%', background: '#2F4858' }}></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[18%] right-[12%] float-3">
          <div className="bg-white text-carbon rounded-lg shadow-pop p-3.5 w-[220px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zred text-white flex items-center justify-center font-extrabold">RM</div>
            <div>
              <div className="text-[13px] font-bold leading-tight">Raúl Méndez</div>
              <div className="text-[11px] text-muted">Founder · En línea</div>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-[#3CB371]"></span>
          </div>
        </div>

        <div className="relative mt-auto p-12 z-10 fade-up delay-3 self-end">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 mb-3">
            More sales, better solutions.
          </div>
          <h2 className="text-[34px] font-extrabold leading-[1.05] tracking-tight max-w-[400px]" style={{ letterSpacing: '-0.03em' }}>
            Tecnología que impulsa el crecimiento del negocio.
          </h2>
          <p className="mt-4 text-white/70 text-[14px] leading-relaxed max-w-[380px]">
            El panel interno donde el equipo de Zivelo gestiona proyectos, pendientes y clientes en un solo lugar.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 max-w-[420px]">
            <div>
              <div className="text-[24px] font-extrabold nums leading-none">7</div>
              <div className="text-[11px] text-white/55 mt-1">Proyectos activos</div>
            </div>
            <div>
              <div className="text-[24px] font-extrabold nums leading-none">131</div>
              <div className="text-[11px] text-white/55 mt-1">Tareas cerradas</div>
            </div>
            <div>
              <div className="text-[24px] font-extrabold nums leading-none">6</div>
              <div className="text-[11px] text-white/55 mt-1">Clientes activos</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
