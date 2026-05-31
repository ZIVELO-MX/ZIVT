'use client';

import { useState, useEffect, useRef } from 'react';
import { getClients, getLearningTasks, getNotifications, getProfiles, getProjects, getTasks, markNotificationRead, markAllNotificationsRead } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import type { Client, Notification, Profile, Task } from '@/lib/supabase/types';
import { Sidebar, Topbar } from '@/components/sidebar';
import { UserMenu, NotificationsDrawer, CommandPalette, InviteModal, KeyboardShortcutsModal, PreferencesDrawer } from '@/components/modals';
import { Ic } from '@/components/icons';
import { SettingsView } from '@/components/settings';
import Dashboard from '@/components/dashboard';
import Kanban from '@/components/kanban';
import Projects from '@/components/projects';
import Clients from '@/components/clients';
import Users from '@/components/users';
import ProfileView from '@/components/profile';
import Learning from '@/components/learning';

export default function HomePage() {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [learning, setLearning] = useState<any[]>([]);

  // Fetch + realtime subscription for all DB tables
  useEffect(() => {
    getProjects().then(setProjects);
    getTasks().then(setTasks);
    getClients().then(setClients);
    getProfiles().then(setProfiles);
    getNotifications().then(setNotifications);
    getLearningTasks().then(setLearning);

    const supabase = createClient();
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        getProjects().then(setProjects);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        getTasks().then(setTasks);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        getClients().then(setClients);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        getProfiles().then(setProfiles);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        getNotifications().then(setNotifications);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_tasks' }, () => {
        getLearningTasks().then(setLearning);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const saved = (() => { try { return localStorage.getItem('zivelo-sidebar') === 'collapsed'; } catch { return false; } })();
    setSidebarCollapsed(saved);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('zivelo-sidebar', sidebarCollapsed ? 'collapsed' : 'expanded'); } catch {}
  }, [sidebarCollapsed]);

  const [density, setDensity] = useState<'compact' | 'default' | 'relaxed'>('default');
  useEffect(() => {
    const saved = (() => { try { return localStorage.getItem('zivelo-density'); } catch { return null; } })();
    const d = (saved === 'compact' || saved === 'relaxed') ? saved : 'default';
    setDensity(d);
    document.documentElement.setAttribute('data-density', d);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    try { localStorage.setItem('zivelo-density', density); } catch {}
  }, [density]);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(c => !c);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(c => !c);
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setShortcutsOpen(c => !c);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts = {
    tasks: tasks.filter(t => t.col !== 'done').length,
    activeProjects: projects.filter(p => p.status !== 'done').length,
    clients: clients.length,
    users: profiles.length,
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        view={view}
        setView={setView}
        counts={counts}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onInvite={() => setInviteOpen(true)}
        onSettings={() => setView('settings')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        profiles={profiles}
      />
      <main className="flex-1 min-w-0 relative">
        <Topbar
          view={view}
          onOpenCommand={() => setCmdOpen(true)}
          onOpenNotifs={() => setNotifsOpen(true)}
          onOpenUserMenu={() => setUserMenuOpen(v => !v)}
          userMenuRef={userMenuRef}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
        <UserMenu
          open={userMenuOpen}
          anchorRef={userMenuRef}
          onClose={() => setUserMenuOpen(false)}
          user={profiles[0] ?? null}
          dark={dark}
          onToggleDark={() => setDark(d => !d)}
          onNavigate={(v: string) => setView(v)}
          onOpenNotifs={() => setNotifsOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenPrefs={() => setPrefsOpen(true)}
        />

        <div data-screen-label={view}>
          {view === 'dashboard' && <Dashboard projects={projects} tasks={tasks} clients={clients} setView={setView} profiles={profiles}/>}
          {view === 'kanban'    && <Kanban    tasks={tasks} setTasks={setTasks} projects={projects} profiles={profiles}/>}
          {view === 'learning'  && <Learning  tasks={learning} setTasks={setLearning} profiles={profiles}/>}
          {view === 'projects'  && <Projects  projects={projects} setProjects={setProjects} clients={clients} tasks={tasks} setTasks={setTasks} teams={teams} setTeams={setTeams} profiles={profiles}/>}
          {view === 'clients'   && <Clients   clients={clients} setClients={setClients} projects={projects} setProjects={setProjects}/>}
          {view === 'users'     && <Users tasks={tasks} projects={projects} teams={teams} setTeams={setTeams} users={profiles} setUsers={setProfiles}/>}
          {view === 'settings' && (
            <SettingsView dark={dark} onToggleDark={() => setDark(d => !d)} density={density} setDensity={setDensity} profiles={profiles} />
          )}
          {view === 'profile' && <ProfileView tasks={tasks} projects={projects} />}
        </div>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={(v: string) => setView(v)}
        projects={projects} clients={clients} tasks={tasks}/>
      <NotificationsDrawer
        open={notifsOpen}
        onClose={() => setNotifsOpen(false)}
        notifications={notifications}
        profiles={profiles}
        onMarkRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
          markNotificationRead(id).catch(e => console.error('markNotificationRead failed:', e));
        }}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
          markAllNotificationsRead().catch(e => console.error('markAllNotificationsRead failed:', e));
        }}
      />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSave={(user) => setProfiles(prev => [...prev, user])} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}/>
      <PreferencesDrawer open={prefsOpen} onClose={() => setPrefsOpen(false)} dark={dark} onToggleDark={() => setDark(d => !d)}/>
    </div>
  );
}
