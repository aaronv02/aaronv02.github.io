/* =========================================================
   SITE DATA — edit this file to update the site.
   To add a new project: copy one object in PROJECTS, tweak,
   done. The page renders everything from this array.
   ========================================================= */

const SITE = {
  name: "Aaron Vajda",
  email: "aaron.vajda@gmail.com",
};

/* ---------------------------------------------------------
   Custom logo marks (for projects without real brand files).
   One family: 96x96, stroke-drawn, currentColor.
   Paths with class "draw" + pathLength="1" animate in.
   Elements with class "pop" fade/scale in after the draw.
   --------------------------------------------------------- */

const LOGOS = {
  inboxpilot: `
  <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <path class="draw" pathLength="1" d="M18 44 v24 a8 8 0 0 0 8 8 h36 a8 8 0 0 0 8 -8 v-14"
          stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
    <path class="draw" pathLength="1" d="M18 46 l26 15 l14 -8"
          stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="pop" d="M60 30 L88 16 L76 42 L69 34 Z"
          fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <path class="pop" d="M36 30 c6 -10 18 -14 27 -11"
          stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1 8"/>
  </svg>`,

  cma: `
  <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <path class="draw" pathLength="1" d="M22 48 L48 26 L74 48"
          stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="draw" pathLength="1" d="M30 44 V74 H66 V44"
          stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="pop" d="M40 66 V58 M48 66 V50 M56 66 V54"
          stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <circle class="pop pop--core" cx="48" cy="26" r="3.6" fill="currentColor"/>
  </svg>`,
};

/* ---------------------------------------------------------
   Projects — rendered top to bottom on the page.
   Fields:
     id        unique slug (used for anchors + spine nav)
     name      display name
     domain    small label next to the chapter number
     headline  big statement for the chapter
     description  2-3 sentences
     features  short bullets
     tags      chips
     accent    the chapter's color (page tints to this on scroll)
     brand     optional real logo: { src, bg: 'light'|'dark'|'none' }
     logo      fallback: key into LOGOS, or inline "<svg …>" string
     mock      'privaj' | 'dashy' | 'claimforge' | 'inboxpilot' | 'cma' | 'generic'
     image     optional: path to a screenshot — replaces the mock
     link      optional: public URL. Omit/null → "Private build" badge
     status    small status pill text
   --------------------------------------------------------- */

const PROJECTS = [
  {
    id: "privaj",
    name: "Privaj",
    domain: "On-premise AI agent platform",
    headline: "AI agents that never leave the building.",
    description:
      "Privaj gives local businesses working AI agents without handing their data to the cloud. The full stack — local LLMs, agent memory, learned skills, business files — runs on a Mac Mini in the client's own shop, encrypted at rest and isolated per client. Owners chat by web app, website widget, or voice while agents handle files, email drafts, and scheduled work.",
    features: [
      "Runs entirely on client-owned hardware",
      "Local models, three-tier routing",
      "Agents learn skills; humans approve them",
      "Encrypted at rest, isolated per client",
    ],
    tags: ["AI Agents", "On-Premise", "Local LLMs", "Privacy"],
    accent: "#8b7cff",
    brand: { src: "assets/brand/privaj-icon.svg", bg: "none" },
    mock: "privaj",
    link: null,
    status: "In production",
  },
  {
    id: "dashy",
    name: "Dashy",
    domain: "Local-first personal dashboard",
    headline: "Mission control that runs on your own machine.",
    description:
      "Dashy is a self-refreshing dashboard that pulls in your GitHub, inbox, calendar, and the AI news you actually care about — then writes a one-line summary of each with an open-source model running locally, so there are no API bills and nothing leaves your machine. It installs to your phone as an app, boots or shuts down remotely, and every data source is a swappable plugin.",
    features: [
      "Summaries from local models — zero cloud keys",
      "Every data source is a plugin",
      "Installs to your phone as a PWA",
      "Boot or kill it remotely from your phone",
    ],
    tags: ["Local LLMs", "Next.js 16", "Dashboard", "PWA"],
    accent: "#4c9bff",
    brand: { src: "assets/brand/dashy-icon.png", bg: "none" },
    mock: "dashy",
    link: null,
    status: "In daily use",
  },
  {
    id: "claim-forge",
    name: "Claim Forge",
    domain: "Voice-first patent drafting",
    headline: "Speak your invention. Forge the patent.",
    description:
      "Claim Forge makes capturing an invention as easy as leaving a voicemail. An inventor talks through the idea, uploads their sketches, and a team of specialized local AI agents interviews them, drafts the application, and independently checks the result — every claim traced back to evidence the inventor approved. All of it offline, inside an encrypted vault.",
    features: [
      "Voice-first interviews, typed input welcome",
      "Encrypted local vault, fail-closed isolation",
      "Every claim traces to approved evidence",
      "Attorney-ready DOCX and PDF export",
    ],
    tags: ["AI Agents", "Patents", "Local-First", "Voice"],
    accent: "#fb7a3c",
    brand: { src: "assets/brand/claim-forge.png", bg: "light" },
    mock: "claimforge",
    link: null,
    status: "In development",
  },
  {
    id: "inbox-pilot",
    name: "InboxPilot",
    domain: "AI email sorter for Gmail",
    headline: "Your inbox, sorted on autopilot.",
    description:
      "InboxPilot plugs into Gmail, learns what matters to you from your own sent history, and keeps every incoming message filed by priority around the clock. New mail is classified every ten minutes into labels you control — with an SMS the moment something urgent lands, custom rules, quiet hours, and AI summaries on top.",
    features: [
      "Learns priorities from your sent history",
      "Auto-sorts new Gmail every 10 minutes",
      "SMS and email alerts for urgent mail",
      "Custom rules, quiet hours, AI summaries",
    ],
    tags: ["AI Email", "Gmail", "Productivity", "SaaS"],
    accent: "#22c7e6",
    logo: "inboxpilot",
    mock: "inboxpilot",
    link: "https://inboxpilot-lyart.vercel.app",
    status: "Live",
  },
  {
    id: "cass-auto-cma",
    name: "Cass's Auto CMA",
    domain: "Real-estate analysis bot",
    headline: "A full market analysis from one slash command.",
    description:
      "Built for a working Colorado realtor, Auto CMA wraps the comparative-market-analysis grind in a private Discord bot. One /cma command kicks off request tracking, a scoring engine that ranks MLS comp exports with written reasoning, and PDF post-processing that trims reports to the pages clients actually read — while every pricing call stays in the realtor's hands.",
    features: [
      "/cma slash command, live progress",
      "Comp scoring with written reasoning",
      "Reports trimmed to client-ready pages",
      "Human approval gate on every CMA",
    ],
    tags: ["Real Estate", "Discord Bot", "Automation", "PDF"],
    accent: "#34d399",
    logo: "cma",
    mock: "cma",
    link: null,
    status: "In production",
  },
];
