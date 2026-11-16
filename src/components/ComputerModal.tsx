import React, { useMemo, useState } from 'react';
import { Archive, ArrowLeft, BriefcaseBusiness, Clock3, ExternalLink, FolderKanban, Grid2X2, Image, Mail, Map, Minus, UserRound, X } from 'lucide-react';
import { CityConfig } from '../types';

interface ComputerModalProps {
  city: CityConfig;
  timeLabel: string;
  onClose: () => void;
}

type AppId = 'desktop' | 'projects' | 'photos' | 'about' | 'experience' | 'journey' | 'contact' | 'archive';

const projects = [
  { id: 'roomforone', title: 'roomforone', category: 'Personal space', year: '2026', tone: 'from-[#d9b386] to-[#8e9b87]', description: 'A quiet room for weather, making, and staying a little longer.', link: 'https://github.com/hydelynye-ui/roomforone' },
  { id: 'focus-space', title: 'Focus Space', category: 'Productivity', year: '2026', tone: 'from-[#bac8dd] to-[#8b9f9f]', description: 'A personal desktop for focus rituals, time, and gentle momentum.', link: 'https://focus-space-d5gmg1bimc422765f-1525079590.tcloudbaseapp.com/' },
  { id: 'foms', title: 'FOMS pricing engine', category: 'Systems', year: '2026', tone: 'from-[#c98664] to-[#a3604c]', description: 'A hybrid freight pricing workspace built around rules and evidence.' },
];

const appMeta: Record<Exclude<AppId, 'desktop'>, { label: string; icon: React.ReactNode }> = {
  projects: { label: 'Projects', icon: <FolderKanban /> },
  photos: { label: 'Photos', icon: <Image /> },
  about: { label: 'About Me', icon: <UserRound /> },
  experience: { label: 'Experience', icon: <BriefcaseBusiness /> },
  journey: { label: 'Journey', icon: <Map /> },
  contact: { label: 'Contact', icon: <Mail /> },
  archive: { label: 'Archive', icon: <Archive /> },
};

export const ComputerModal: React.FC<ComputerModalProps> = ({ city, timeLabel, onClose }) => {
  const [activeApp, setActiveApp] = useState<AppId>('desktop');
  const [openedProject, setOpenedProject] = useState<string | null>(null);
  const isDesktop = activeApp === 'desktop';
  const activeTitle = isDesktop ? 'roomforone desktop' : appMeta[activeApp].label;
  const opened = useMemo(() => projects.find((project) => project.id === openedProject), [openedProject]);

  const openApp = (app: AppId) => {
    setOpenedProject(null);
    setActiveApp(app);
  };

  return (
    <div className="computer-world fixed inset-0 z-50 flex items-center justify-center bg-[#15202a]/35 p-0 sm:p-5 md:p-8" onClick={onClose}>
      <div className="computer-shell relative flex h-full w-full max-w-[1440px] flex-col overflow-hidden border border-white/25 bg-[#eff2f0] shadow-[0_34px_120px_rgba(18,27,31,.38)] sm:h-[min(880px,calc(100vh-40px))] sm:rounded-[2rem]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/10 bg-white/65 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full bg-[#d97561] text-white transition hover:brightness-105" title="Return to room"><X className="h-3.5 w-3.5" /></button>
            <button onClick={() => openApp('desktop')} className="grid h-7 w-7 place-items-center rounded-full bg-[#d7b57e] text-white transition hover:brightness-105" title="Desktop"><Grid2X2 className="h-3.5 w-3.5" /></button>
            <button onClick={() => setActiveApp('desktop')} className="grid h-7 w-7 place-items-center rounded-full bg-[#8fa38e] text-white transition hover:brightness-105" title="Minimize"><Minus className="h-3.5 w-3.5" /></button>
            <span className="ml-2 text-[11px] font-semibold tracking-[.16em] text-[#203039]/55">{activeTitle}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#203039]/55"><span className="hidden sm:inline">{city.name}</span><span className="tabular-nums">{timeLabel}</span></div>
        </div>

        <div className="relative flex min-h-0 flex-1 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.95),transparent_35%),linear-gradient(135deg,#e8eee9,#dce4e0)]">
          <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(58,77,75,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(58,77,75,.04)_1px,transparent_1px)] [background-size:42px_42px]" />
          <aside className="relative z-10 hidden w-56 shrink-0 border-r border-black/10 bg-white/35 p-4 backdrop-blur-xl md:block">
            <div className="mb-6 px-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#203039]/45">Applications</div>
            <nav className="space-y-1">
              {(Object.keys(appMeta) as Array<Exclude<AppId, 'desktop'>>).map((id) => (
                <button key={id} onClick={() => openApp(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeApp === id ? 'bg-[#203039] text-white shadow-lg shadow-[#203039]/15' : 'text-[#203039]/70 hover:bg-white/70'}`}>
                  <span className="[&>svg]:h-4 [&>svg]:w-4">{appMeta[id].icon}</span><span>{appMeta[id].label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 rounded-2xl border border-white/70 bg-white/55 p-3 text-[11px] leading-5 text-[#203039]/60"><Clock3 className="mb-2 h-4 w-4 text-[#a45e42]" />A small desktop for work, images, notes, and the things that stay in progress.</div>
          </aside>

          <section className="relative z-10 min-w-0 flex-1 overflow-y-auto p-5 pb-28 sm:p-8 sm:pb-28 lg:p-12">
            <div className="mx-auto max-w-5xl animate-[windowIn_.35s_ease-out]">
              {isDesktop ? <DesktopHome onOpen={openApp} /> : opened ? <ProjectDetail project={opened} onBack={() => setOpenedProject(null)} /> : <AppWindow id={activeApp} onOpenProject={(id) => setOpenedProject(id)} />}
            </div>
          </section>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/75 bg-white/70 p-2 shadow-xl shadow-[#203039]/10 backdrop-blur-2xl">
            <button onClick={() => openApp('desktop')} className={`grid h-11 w-11 place-items-center rounded-xl transition ${isDesktop ? 'bg-[#203039] text-white' : 'text-[#203039]/65 hover:bg-white'}`}><Grid2X2 className="h-5 w-5" /></button>
            {(Object.keys(appMeta) as Array<Exclude<AppId, 'desktop'>>).map((id) => <button key={id} onClick={() => openApp(id)} title={appMeta[id].label} className={`grid h-11 w-11 place-items-center rounded-xl transition ${activeApp === id ? 'bg-[#d9b386] text-[#203039]' : 'text-[#203039]/65 hover:bg-white'}`}><span className="[&>svg]:h-5 [&>svg]:w-5">{appMeta[id].icon}</span></button>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopHome: React.FC<{ onOpen: (app: AppId) => void }> = ({ onOpen }) => (
  <div>
    <div className="max-w-2xl"><div className="mb-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#a45e42]">Personal desktop</div><h1 className="text-4xl font-semibold tracking-[-.06em] text-[#203039] sm:text-6xl">Make some room<br /><span className="text-[#a45e42]">for one.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-[#203039]/60">A quiet collection of projects, photographs, working notes, and the paths between them.</p></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(appMeta) as Array<Exclude<AppId, 'desktop'>>).map((id) => <button key={id} onClick={() => onOpen(id)} className="group min-h-32 rounded-3xl border border-white/75 bg-white/55 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"><span className="mb-7 grid h-10 w-10 place-items-center rounded-2xl bg-[#efe8dc] text-[#a45e42] [&>svg]:h-4 [&>svg]:w-4">{appMeta[id].icon}</span><span className="block text-sm font-semibold text-[#203039]">{appMeta[id].label}</span><span className="mt-1 block text-[11px] text-[#203039]/50">Open window</span></button>)}
    </div>
  </div>
);

const AppWindow: React.FC<{ id: Exclude<AppId, 'desktop'>; onOpenProject: (id: string) => void }> = ({ id, onOpenProject }) => {
  if (id === 'projects') return <div><WindowHeading eyebrow="Projects" title="Things in motion" description="Selected work across space, tools, and systems." /><div className="grid gap-4 md:grid-cols-2">{projects.map((project) => <button key={project.id} onClick={() => onOpenProject(project.id)} className="group overflow-hidden rounded-3xl border border-white/80 bg-white/70 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`h-32 bg-gradient-to-br ${project.tone} p-5 text-white`}><span className="text-[10px] uppercase tracking-[.22em] opacity-75">{project.year} · {project.category}</span><div className="mt-8 text-xl font-semibold tracking-tight">{project.title}</div></div><div className="p-5"><p className="text-sm leading-6 text-[#203039]/65">{project.description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#a45e42]">Open project <ArrowLeft className="h-3 w-3 rotate-180" /></span></div></button>)}</div></div>;
  if (id === 'photos') return <div><WindowHeading eyebrow="Photos" title="Small observations" description="A placeholder gallery for images and notes that belong here." /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#c9a47e] via-[#e8d7bd] to-[#8c9c8c]" /><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#becbd4] via-[#f1eadf] to-[#c98464]" /><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#52646b] via-[#9eada0] to-[#d5b484]" /><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#efe8dc] via-[#c98464] to-[#495755]" /><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#b6c9ca] via-[#f7f2ea] to-[#d8b98d]" /><div className="aspect-square rounded-3xl bg-gradient-to-br from-[#8c9b89] via-[#d8c1a5] to-[#56616b]" /></div></div>;
  const copy: Record<string, { eyebrow: string; title: string; description: string; body: React.ReactNode }> = {
    about: { eyebrow: 'About me', title: 'A room for making.', description: 'A concise introduction can live here when the final personal copy is ready.', body: <p>I like building calm interfaces, useful systems, and small worlds that reward curiosity. This content is intentionally easy to replace with the owner’s real biography.</p> },
    experience: { eyebrow: 'Experience', title: 'Work, learning, practice.', description: 'A timeline for roles, studies, and the skills that keep changing shape.', body: <div className="space-y-4"><TimelineItem year="2026" title="Independent projects" text="Product experiments, logistics tools, and interactive spaces." /><TimelineItem year="2024" title="Systems and interfaces" text="A growing practice in data, workflows, and human-readable software." /></div> },
    journey: { eyebrow: 'Journey', title: 'Keep following the thread.', description: 'A visual timeline for experiments, pivots, and things still becoming.', body: <div className="border-l border-[#c98464]/35 pl-5"><p className="text-sm leading-7 text-[#203039]/65">Start with a small room. Add a window. Let weather in. Keep the work close enough to touch.</p></div> },
    contact: { eyebrow: 'Contact', title: 'Say hello.', description: 'Public contact details can be placed here when ready.', body: <div className="grid gap-3 sm:grid-cols-2"><a className="rounded-2xl border border-white/80 bg-white/65 p-4 text-sm font-semibold text-[#203039] hover:bg-white" href="mailto:hello@example.com">hello@example.com <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="rounded-2xl border border-white/80 bg-white/65 p-4 text-sm font-semibold text-[#203039] hover:bg-white" href="https://github.com/hydelynye-ui" target="_blank" rel="noreferrer">GitHub <ExternalLink className="ml-1 inline h-3 w-3" /></a></div> },
    archive: { eyebrow: 'Archive', title: 'Older notes and experiments.', description: 'A quieter shelf for work that shaped the room.', body: <div className="grid gap-2"><div className="rounded-2xl border border-white/70 bg-white/60 p-4 text-sm text-[#203039]/70">weather-room / early sketches</div><div className="rounded-2xl border border-white/70 bg-white/60 p-4 text-sm text-[#203039]/70">small tools / unfinished ideas</div></div> },
  };
  const entry = copy[id];
  return <div><WindowHeading eyebrow={entry.eyebrow} title={entry.title} description={entry.description} /><div className="max-w-2xl rounded-3xl border border-white/75 bg-white/60 p-6 text-sm leading-7 text-[#203039]/70 sm:p-8">{entry.body}</div></div>;
};

const ProjectDetail: React.FC<{ project: typeof projects[number]; onBack: () => void }> = ({ project, onBack }) => <div><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-[#a45e42]"><ArrowLeft className="h-3.5 w-3.5" />Back to Projects</button><div className={`mb-7 h-48 rounded-[2rem] bg-gradient-to-br ${project.tone} p-7 text-white sm:h-64`}><span className="text-[10px] uppercase tracking-[.22em] opacity-75">{project.year} · {project.category}</span><h1 className="mt-16 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">{project.title}</h1></div><p className="max-w-2xl text-lg leading-8 text-[#203039]/70">{project.description}</p>{project.link && <a href={project.link} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#203039] px-5 py-3 text-xs font-semibold text-white">Open link <ExternalLink className="h-3.5 w-3.5" /></a>}</div>;

const WindowHeading: React.FC<{ eyebrow: string; title: string; description: string }> = ({ eyebrow, title, description }) => <div className="mb-8"><div className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#a45e42]">{eyebrow}</div><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#203039] sm:text-5xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#203039]/60">{description}</p></div>;
const TimelineItem: React.FC<{ year: string; title: string; text: string }> = ({ year, title, text }) => <div className="flex gap-4"><span className="pt-0.5 text-[11px] font-semibold text-[#a45e42]">{year}</span><div><div className="font-semibold text-[#203039]">{title}</div><p className="text-sm leading-6 text-[#203039]/60">{text}</p></div></div>;
