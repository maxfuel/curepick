import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton, WeChatButton } from "@/components/ui/ContactButtons";
import {
  Globe, ShieldCheck, Users, ChevronRight,
  Stethoscope, HeartHandshake, Building2,
} from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "About Curepick — Korea's VVIP Healthcare Marketplace",
  description:
    "Curepick is Korea's leading healthcare service marketplace, connecting global patients with world-class Korean medical treatment through a verified partner ecosystem.",
};

const HOW_IT_WORKS = [
  {
    icon: <Globe className="size-7 text-blue-500" />,
    role: "Local Agent",
    portal: "/partner",
    color: "from-blue-50 to-sky-50 border-blue-100",
    description:
      "Based in Singapore, China, UAE, or Europe, our Local Agents identify and counsel patients in their home country — then register cases on the Curepick platform for seamless handoff.",
  },
  {
    icon: <HeartHandshake className="size-7 text-indigo-500" />,
    role: "Cure Partner",
    portal: "/cure-partner",
    color: "from-indigo-50 to-violet-50 border-indigo-100",
    description:
      "A Cure Partner (JMM) physically accompanies the patient throughout their entire Korean journey — airport arrival, hospital visits, wellness recovery, and departure. They are the human face of Curepick.",
  },
  {
    icon: <Building2 className="size-7 text-emerald-500" />,
    role: "Hospital",
    portal: "/hospital",
    color: "from-emerald-50 to-teal-50 border-emerald-100",
    description:
      "Korea's top-tier hospitals deliver world-class medical treatment. Hospital staff confirm appointments, update case status, and respond to patient inquiries through their dedicated portal.",
  },
];

const VALUES = [
  {
    icon: <Stethoscope className="size-6 text-primary" />,
    title: "Service First",
    description: "Patients search for services, not hospitals. We always lead with the treatment — not the brand.",
  },
  {
    icon: <ShieldCheck className="size-6 text-primary" />,
    title: "Evidence Based",
    description: "Every data point — volume, pricing, specialist counts — is backed by verified, traceable sources.",
  },
  {
    icon: <Users className="size-6 text-primary" />,
    title: "Partner Network is Core",
    description: "The collaboration between Local Agents, Cure Partners, and Hospitals is the operational backbone of the platform.",
  },
  {
    icon: <Globe className="size-6 text-primary" />,
    title: "Multilingual by Default",
    description: "English, Korean, Chinese, Japanese, Arabic — every part of the platform is built for global patients from day one.",
  },
];

const PARTNER_ECOSYSTEM = [
  {
    name: "Ministry of Health & Welfare",
    detail: "Registered Foreign Patient Recruitment Institution",
    badge: "Government Certified",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Chengdam Cell Medical Clinic",
    detail: "Korea's leading anti-aging & stem cell treatment centre",
    badge: "Medical Partner",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Odaesan Meditation Village",
    detail: "Premium post-treatment wellness & digital detox retreat",
    badge: "Wellness Partner",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    name: "Kyung Hee University Oriental Medicine",
    detail: "Exclusive meditation programme co-developed with Prof. Jong-Woo Kim (President, Korean Society of Meditation)",
    badge: "Academic Partner",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 sm:py-32 text-white text-center">
        <div className="container mx-auto px-4 space-y-6">
          <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/10">
            About Curepick
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            The World&apos;s Most Trusted<br />
            <span className="text-blue-300">Korean Healthcare Platform</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/75">
            Curepick is not a hospital directory or a ranking site. We are a Healthcare Service Marketplace — placing the patient&apos;s intent at the centre, and surrounding it with a world-class partner ecosystem.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 space-y-24">

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline">Our Mission</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Patients search for<br />
              <span className="text-primary">services — not hospitals.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The conventional model sends patients to a hospital first, then a doctor, then a treatment. Curepick reverses this: we start with what the patient actually wants — Ultherapy, a stem cell programme, dental implants — and build an intelligent pathway to the right provider.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              But discovery alone is not enough. The real journey begins after a patient decides to come to Korea. That is where our partner ecosystem — Local Agents, Cure Partners, and Hospitals — closes the loop.
            </p>
          </div>
          <div className="bg-muted/30 border rounded-2xl p-8 font-mono text-sm space-y-2 text-muted-foreground">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Curepick Philosophy</p>
            <p><span className="text-primary font-bold">Intent</span> → Category → Service</p>
            <p className="pl-8">→ Procedure → Package</p>
            <p className="pl-16">→ Hospital → Doctor</p>
            <p className="pl-8 mt-4 text-xs border-t pt-4">
              ↕ Partner Ecosystem<br />
              (Agent ↔ Cure Partner ↔ Hospital)
            </p>
          </div>
        </section>

        {/* ── How We Work ──────────────────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Three Partners. One Seamless Journey.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Behind every successful healthcare journey is a three-party collaboration working in perfect sync.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className={`rounded-2xl border bg-gradient-to-br ${item.color} p-7 space-y-4`}>
                <div className="flex items-center justify-between">
                  {item.icon}
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Step {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-xl font-bold">{item.role}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/cure-partners"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Learn more about Cure Partners <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline">Our Principles</Badge>
            <h2 className="text-3xl font-bold">Built on Uncompromising Standards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-xl border p-6">
                <div className="mt-0.5 shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Partner Ecosystem ────────────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline">Verified Partners</Badge>
            <h2 className="text-3xl font-bold">Our Partner Network</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every partner in the Curepick ecosystem is rigorously vetted for quality, compliance, and patient outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PARTNER_ECOSYSTEM.map((p) => (
              <div key={p.name} className="flex items-start gap-4 rounded-xl border p-5">
                <ShieldCheck className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{p.name}</h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-16 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Experience Curepick?</h2>
          <p className="text-white/80 max-w-lg mx-auto text-lg">
            Discover Korea&apos;s best medical services, compare providers, and connect with a dedicated Cure Partner — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90 transition-colors"
            >
              Browse Services <ChevronRight className="size-4" />
            </Link>
            <WhatsAppButton />
            <WeChatButton />
          </div>
        </section>
      </div>
    </div>
  );
}
