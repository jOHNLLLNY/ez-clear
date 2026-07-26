"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  Hammer,
  Home,
  MapPin,
  MessageCircle,
  PaintRoller,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react"

type Experience = "hirer" | "worker"

const services = [
  { name: "Interior Painting", icon: PaintRoller, tone: "bg-lime-100 text-blue-700" },
  { name: "Drywall Installation", icon: Home, tone: "bg-blue-50 text-blue-700" },
  { name: "Drywall Repair", icon: Hammer, tone: "bg-violet-50 text-blue-700" },
  { name: "Bathroom Renovation", icon: Wrench, tone: "bg-cyan-50 text-blue-700" },
]

const jobs = [
  {
    title: "Ceiling crack repair",
    category: "Plaster Repair",
    location: "York, Toronto",
    meta: "Posted 17h ago",
    views: 32,
    applicants: 5,
    budget: "Open budget",
  },
  {
    title: "Paint an entire house",
    category: "Interior Painting",
    location: "Mississauga",
    meta: "Posted 21h ago",
    views: 48,
    applicants: 8,
    budget: "$4,000",
  },
  {
    title: "Basement drywall installation",
    category: "Drywall",
    location: "Vaughan",
    meta: "Posted today",
    views: 19,
    applicants: 3,
    budget: "$2,500–$3,500",
  },
]

const pros = [
  {
    name: "PReno",
    trade: "General contractor",
    location: "Toronto",
    rating: "5.0",
    reviews: "34 reviews",
    services: "Basement finishing · Bathroom renovation · Painting",
  },
  {
    name: "GDF Reno Inc.",
    trade: "Drywall installer",
    location: "Hamilton",
    rating: "New",
    reviews: "Verified profile",
    services: "Drywall installation · Taping · Repairs",
  },
]

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#071633] text-lg font-black italic text-white shadow-lg shadow-blue-900/20">
        EZ
      </div>
      <div className="leading-none">
        <div className="text-xl font-black tracking-tight text-[#071633]">Clear</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Get work done</div>
      </div>
    </div>
  )
}

function AppShell({ experience }: { experience: Experience }) {
  const isHirer = experience === "hirer"

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f6f8fd] shadow-[0_30px_80px_rgba(9,30,66,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-7">
        <Logo />
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#071633] transition hover:border-blue-300 hover:text-blue-600" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-[#071633] text-sm font-black text-white" aria-label="Account">
            {isHirer ? "SB" : "PR"}
          </button>
        </div>
      </div>

      <div className="grid min-h-[690px] lg:grid-cols-[230px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white p-4 lg:block">
          <nav className="space-y-2">
            {[
              [Home, "Home", true],
              [isHirer ? BriefcaseBusiness : Search, isHirer ? "My Jobs" : "Find Work", false],
              [Plus, "Post a Job", false],
              [MessageCircle, "Messages", false],
              [CircleUserRound, "Profile", false],
            ].map(([Icon, label, active]) => (
              <button
                key={String(label)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-slate-100 hover:text-[#071633]"
                }`}
              >
                {/* @ts-expect-error icon component */}
                <Icon className="h-5 w-5" />
                {label as string}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl bg-[#071633] p-5 text-white">
            <Sparkles className="h-6 w-6 text-lime-400" />
            <p className="mt-4 font-black">EZ Clear Pro</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Get priority access, verified badges, and better job visibility.</p>
            <button className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-xs font-black text-[#071633]">Explore Pro</button>
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-sm font-bold text-slate-500">Hello, {isHirer ? "Santa" : "PReno"}</div>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-[#071633] sm:text-4xl">
                {isHirer ? "Ready to clear some tasks off your list?" : "Find your next local project."}
              </h2>
            </div>
            <Link
              href={isHirer ? "/post-job" : "/search"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {isHirer ? "Post a New Job" : "Explore Jobs"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isHirer ? <HirerDashboard /> : <WorkerDashboard />}
        </main>
      </div>
    </div>
  )
}

function HirerDashboard() {
  return (
    <div className="mt-7 space-y-7">
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
        <Link href="/post-job" className="group rounded-3xl bg-blue-600 p-6 text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lime-400 text-[#071633]">
              <Plus className="h-8 w-8" />
            </div>
            <ArrowRight className="h-7 w-7 transition group-hover:translate-x-1" />
          </div>
          <h3 className="mt-7 text-2xl font-black">Post a New Job</h3>
          <p className="mt-2 text-sm text-blue-100">Tell local professionals what you need done.</p>
        </Link>

        <button className="rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-100 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-black text-[#071633]">Photo to Price</h3>
          <p className="mt-2 text-sm text-slate-500">Get an instant AI estimate.</p>
        </button>

        <Link href="/my-jobs/hirer" className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-black text-[#071633]">My Jobs</h3>
          <p className="mt-2 text-sm text-slate-500">Manage projects and offers.</p>
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Your job is live</div>
            <div className="mt-1 text-lg font-black text-[#071633]">Ceiling cracks</div>
          </div>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600">2 offers</div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black text-[#071633]">Popular services</h3>
          <Link href="/services" className="text-sm font-black text-blue-600">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ name, icon: Icon, tone }) => (
            <Link key={name} href={`/post-job?service=${encodeURIComponent(name)}`} className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="font-black text-[#071633]">{name}</span>
                <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <MapPanel title="Available pros near you" count="2 live" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-[#071633]">Top local pros</h3>
            <Link href="/search/contractors" className="text-sm font-black text-blue-600">Explore</Link>
          </div>
          {pros.map((pro) => <ProCard key={pro.name} pro={pro} />)}
        </div>
      </section>
    </div>
  )
}

function WorkerDashboard() {
  return (
    <div className="mt-7 space-y-7">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <MapPanel title="Open jobs near you" count="12 live" />
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            [BriefcaseBusiness, "3", "Active applications"],
            [MessageCircle, "5", "New messages"],
            [Star, "5.0", "Profile rating"],
          ].map(([Icon, value, label]) => (
            <div key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  {/* @ts-expect-error icon component */}
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#071633]">{value as string}</div>
                  <div className="text-sm font-semibold text-slate-500">{label as string}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black text-[#071633]">Nearby jobs</h3>
          <Link href="/search" className="text-sm font-black text-blue-600">View all</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.title} job={job} />)}
        </div>
      </section>
    </div>
  )
}

function MapPanel({ title, count }: { title: string; count: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-xl font-black text-[#071633]">{title}</h3>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">● {count}</span>
      </div>
      <div className="relative m-5 h-[315px] overflow-hidden rounded-[24px] bg-[#dff2d4]">
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#85d8f2]" />
        <div className="absolute -left-16 top-10 h-10 w-[120%] rotate-[16deg] border-y-[5px] border-white/90 bg-slate-300" />
        <div className="absolute left-10 top-24 h-8 w-[95%] -rotate-[8deg] border-y-4 border-white/90 bg-slate-300" />
        <div className="absolute left-[48%] top-8 h-[90%] w-8 rotate-[18deg] border-x-4 border-white/90 bg-slate-300" />
        <div className="absolute left-7 top-8 rounded-full bg-white/85 px-3 py-1.5 text-xs font-black text-slate-600">Vaughan</div>
        <div className="absolute right-8 top-16 rounded-full bg-white/85 px-3 py-1.5 text-xs font-black text-slate-600">Markham</div>
        <div className="absolute bottom-24 left-[38%] rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-600">Mississauga</div>
        <div className="absolute left-[57%] top-[46%] grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#071633] text-xl font-black text-white shadow-xl">2</div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#071633] shadow-lg">
          <MapPin className="h-4 w-4 text-blue-600" /> Greater Toronto Area
        </div>
      </div>
    </div>
  )
}

function ProCard({ pro }: { pro: (typeof pros)[number] }) {
  return (
    <Link href="/search/contractors" className="group block rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#071633] font-black text-white">{pro.name.slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-black text-[#071633]">{pro.name}</h4>
              <p className="mt-1 text-sm font-semibold text-slate-500">{pro.trade}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{pro.location}</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{pro.rating} · {pro.reviews}</span>
          </div>
          <p className="mt-3 truncate text-sm font-bold text-blue-600">{pro.services}</p>
        </div>
      </div>
    </Link>
  )
}

function JobCard({ job }: { job: (typeof jobs)[number] }) {
  return (
    <Link href="/search" className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{job.category}</span>
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
      </div>
      <h4 className="mt-4 text-xl font-black text-[#071633]">{job.title}</h4>
      <div className="mt-3 text-lg font-black text-blue-600">{job.budget}</div>
      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <MapPin className="h-4 w-4" /> {job.location}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{job.views}</span>
        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{job.applicants}</span>
        <span className="ml-auto flex items-center gap-1"><Clock3 className="h-4 w-4" />{job.meta}</span>
      </div>
    </Link>
  )
}

export default function EZClearWebPage() {
  const [experience, setExperience] = useState<Experience>("hirer")

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-[#071633]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link href="/web"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-blue-600">How it works</a>
            <a href="#services" className="transition hover:text-blue-600">Services</a>
            <a href="#web-app" className="transition hover:text-blue-600">Web app</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/onboarding" className="hidden rounded-xl px-4 py-2.5 text-sm font-black text-[#071633] transition hover:bg-slate-100 sm:inline-flex">Sign in</Link>
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#071633] px-4 py-20 text-white sm:px-6 lg:px-10 lg:py-28">
          <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-blue-600/25 blur-3xl" />
          <div className="absolute -bottom-64 left-1/3 h-[500px] w-[500px] rounded-full bg-lime-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <Sparkles className="h-4 w-4" /> EZ Clear for Web
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Get quality home services done in the <span className="text-blue-500">GTA.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                Post projects, discover trusted local professionals, compare offers, message securely, and manage every job from one powerful web platform.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-500">
                  Start using EZ Clear <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#web-app" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">
                  Explore the web app
                </a>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-7">
                {[["2-sided", "Marketplace"], ["GTA", "Local coverage"], ["24/7", "Web access"]].map(([value, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black">{value}</div>
                    <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-blue-500/20 to-lime-400/10 blur-2xl" />
              <div className="relative rounded-[34px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                <AppShell experience={experience} />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1500px]">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">One platform, two experiences</div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#071633] sm:text-5xl">Built for people who need work done—and people ready to do it.</h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <button onClick={() => setExperience("hirer")} className={`rounded-[32px] border p-7 text-left transition ${experience === "hirer" ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${experience === "hirer" ? "bg-lime-400 text-[#071633]" : "bg-lime-100 text-blue-600"}`}><Home className="h-7 w-7" /></div>
                <h3 className="mt-7 text-2xl font-black">For Hirers</h3>
                <p className={`mt-3 leading-7 ${experience === "hirer" ? "text-blue-100" : "text-slate-500"}`}>Post a job, find local professionals, compare applicants, review profiles, and keep every conversation organized.</p>
              </button>
              <button onClick={() => setExperience("worker")} className={`rounded-[32px] border p-7 text-left transition ${experience === "worker" ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${experience === "worker" ? "bg-lime-400 text-[#071633]" : "bg-blue-50 text-blue-600"}`}><Hammer className="h-7 w-7" /></div>
                <h3 className="mt-7 text-2xl font-black">For Workers</h3>
                <p className={`mt-3 leading-7 ${experience === "worker" ? "text-blue-100" : "text-slate-500"}`}>Discover nearby jobs, apply to projects, message clients, track applications, and build a trusted professional profile.</p>
              </button>
            </div>
          </div>
        </section>

        <section id="web-app" className="bg-white px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Live interface preview</div>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#071633] sm:text-5xl">Your mobile experience, redesigned for the web.</h2>
              </div>
              <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
                <button onClick={() => setExperience("hirer")} className={`rounded-xl px-5 py-3 text-sm font-black transition ${experience === "hirer" ? "bg-white text-blue-600 shadow" : "text-slate-500"}`}>Hirer view</button>
                <button onClick={() => setExperience("worker")} className={`rounded-xl px-5 py-3 text-sm font-black transition ${experience === "worker" ? "bg-white text-blue-600 shadow" : "text-slate-500"}`}>Worker view</button>
              </div>
            </div>
            <div className="mt-10"><AppShell experience={experience} /></div>
          </div>
        </section>

        <section id="services" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1500px] rounded-[38px] bg-[#071633] px-6 py-14 text-white sm:px-10 lg:px-16 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-lime-400"><ShieldCheck className="h-5 w-5" /> Built for trust</div>
                <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Everything you need to move a project forward.</h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Clear profiles, project details, ratings, messages, local discovery, and application tracking—all working together in one consistent system.</p>
                <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#071633] transition hover:-translate-y-0.5">Create your account <ArrowRight className="h-5 w-5" /></Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [Users, "Trusted profiles", "Ratings, reviews, services, portfolios, and business details."],
                  [MapPin, "Local discovery", "Find projects and professionals across the GTA by area."],
                  [MessageCircle, "Built-in messaging", "Keep every project conversation in one secure place."],
                  [BriefcaseBusiness, "Project management", "Track posted jobs, applicants, offers, and active work."],
                ].map(([Icon, title, text]) => (
                  <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
                      {/* @ts-expect-error icon component */}
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-black">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-sm font-semibold text-slate-500">© 2026 EZ Clear. Get Work Done.</p>
        </div>
      </footer>
    </div>
  )
}
