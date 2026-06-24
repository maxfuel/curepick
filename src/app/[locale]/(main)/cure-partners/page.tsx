import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Car, Building2, Languages, Leaf, HeartPulse,
  FileCheck, Globe, UserCheck, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton, WeChatButton } from "@/components/ui/ContactButtons";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Cure Partner — Your Dedicated Medical Journey Companion | Curepick",
  description:
    "From airport arrival to your safe return home, Curepick Cure Partners provide 1-on-1 VIP medical care coordination throughout your entire Korea healthcare journey.",
};

const PROTOCOL_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  airport_pickup:          { label: "Airport VIP Pickup & Limousine", icon: <Car className="size-5" /> },
  hospital_accompany:      { label: "Hospital Accompaniment", icon: <Building2 className="size-5" /> },
  translation:             { label: "Multilingual Translation", icon: <Languages className="size-5" /> },
  meditation_arrangement:  { label: "Wellness & Meditation Arrangement", icon: <Leaf className="size-5" /> },
  post_care:               { label: "Post-Departure Follow-up", icon: <HeartPulse className="size-5" /> },
  visa_support:            { label: "Visa & Document Support", icon: <FileCheck className="size-5" /> },
  accommodation:           { label: "Accommodation Arrangement", icon: <Globe className="size-5" /> },
};

const VIP_BADGE: Record<string, string> = {
  vvip: "bg-amber-100 text-amber-700 border-amber-200",
  vip: "bg-purple-100 text-purple-700 border-purple-200",
  standard: "bg-slate-100 text-slate-600 border-slate-200",
};

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Pre-Check",
    subtitle: "Before You Arrive",
    description:
      "Your Cure Partner begins working with you before you even board your flight. We conduct a virtual pre-consultation from your local city — understanding your health goals, arranging medical records translation, and building your personalised treatment plan.",
    color: "from-sky-500 to-blue-600",
  },
  {
    step: "02",
    title: "Medical Care",
    subtitle: "World-Class Treatment in Korea",
    description:
      "From airport arrival with a private limousine to every hospital appointment, your Cure Partner is by your side. We liaise with doctors, provide real-time translation, manage your daily schedule, and ensure you receive the highest standard of care.",
    color: "from-indigo-500 to-violet-600",
  },
  {
    step: "03",
    title: "Premium Recovery",
    subtitle: "Restore Mind & Body",
    description:
      "Following treatment, immerse yourself in an optional premium recovery programme — private meditation sessions in Korea's ancient mountain temples, digital detox in pristine nature, and a curated wellness itinerary designed to complete your healing journey.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: "04",
    title: "Continuative Care",
    subtitle: "Support After You Return",
    description:
      "Your Cure Partner's commitment doesn't end at the departure gate. We maintain regular follow-up contact, coordinate with your home physician if needed, and invite you into our exclusive alumni community for ongoing health support.",
    color: "from-rose-500 to-pink-600",
  },
];

export default async function CurePartnersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: curePartners } = await supabase
    .from("cure_partners")
    .select(
      "id, full_name, photo_url, title, bio, languages, specialty_areas, service_regions, vip_level, protocol_features, years_experience, patient_count, nationality, base_country"
    )
    .eq("status", "active")
    .order("vip_level");

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 20%, #0ea5e9 0%, transparent 50%)" }}
        />
        <div className="container relative mx-auto px-4 text-center space-y-6">
          <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/10">
            Cure Partner · JMM Programme
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Your Dedicated<br />
            <span className="text-blue-300">Medical Journey</span> Companion
          </h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-white/75 leading-relaxed">
            From the moment you arrive in Korea to the day you return home —
            and beyond — your personal Cure Partner manages every detail of your healthcare journey.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-white/90 transition-colors"
            >
              Connect with a Cure Partner <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/cure-partners#our-partners"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Meet Our Partners
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 space-y-24">

        {/* ── What is a Cure Partner ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline">What is a Cure Partner?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Not just a coordinator —<br />
              <span className="text-primary">your brand-face in Korea.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A Cure Partner (also known as a JMM — Jairos Medical Manager) is a dedicated, bilingual healthcare concierge who takes full responsibility for your entire experience in Korea.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              While a Local Agent connects you to Curepick from your home country, your Cure Partner is the person who physically walks alongside you — from the airport arrival hall to the hospital consultation room, to your recovery stay, and all the way to your departure gate.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: <UserCheck className="size-6 text-primary" />, label: "1:1 Dedicated", sub: "Exclusive focus on you" },
                { icon: <Languages className="size-6 text-primary" />, label: "Multilingual", sub: "Korean, English, Chinese & more" },
                { icon: <HeartPulse className="size-6 text-primary" />, label: "Full Lifecycle", sub: "Pre-arrival to post-departure" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border p-4 text-center space-y-2">
                  <div className="flex justify-center">{item.icon}</div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border p-8 space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">The Cure Partner Difference</p>
            {[
              { role: "Local Agent", action: "Connects patients to Curepick from overseas" },
              { role: "Cure Partner", action: "Physically accompanies patients through every step in Korea" },
              { role: "Hospital", action: "Delivers the medical treatment" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 size-2 rounded-full shrink-0 ${i === 1 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div>
                  <span className={`text-sm font-semibold ${i === 1 ? "text-primary" : ""}`}>{item.role}</span>
                  <span className="text-sm text-muted-foreground"> — {item.action}</span>
                </div>
              </div>
            ))}
            <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-primary font-medium">
                "The Cure Partner is the real face of Curepick. Every patient's experience of Curepick is, in essence, their experience of their Cure Partner."
              </p>
            </div>
          </div>
        </section>

        {/* ── 4-Step Journey ──────────────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline">The Premium Journey</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">4 Steps. Seamlessly Managed.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every Curepick journey follows a proven four-stage protocol — designed to deliver world-class medical outcomes with zero stress.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY_STEPS.map((s) => (
              <div key={s.step} className="rounded-2xl border overflow-hidden group hover:shadow-lg transition-shadow">
                <div className={`bg-gradient-to-br ${s.color} p-6 text-white`}>
                  <div className="text-4xl font-black opacity-50">{s.step}</div>
                  <h3 className="text-lg font-bold mt-1">{s.title}</h3>
                  <p className="text-sm text-white/80">{s.subtitle}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Protocol Features ────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline">JMM Protocol</Badge>
            <h2 className="text-3xl font-bold">Zero Detail Overlooked</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every aspect of your Korean healthcare experience is planned, coordinated, and executed by your Cure Partner.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(PROTOCOL_LABELS).map((p) => (
              <div key={p.label} className="flex items-center gap-3 rounded-xl bg-white border px-5 py-4">
                <span className="text-primary">{p.icon}</span>
                <span className="text-sm font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our Cure Partners ────────────────────────────────────────────── */}
        <section id="our-partners" className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline">Our Team</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Meet Your Cure Partners</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Multilingual, medically-trained, and deeply committed to your care.
            </p>
          </div>

          {curePartners && curePartners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curePartners.map((cp) => {
                const titleStr =
                  getLocalizedField(cp.title as Record<string, string> | null, locale) ||
                  getLocalizedField(cp.title as Record<string, string> | null, "en") ||
                  "Cure Partner";
                const bioStr =
                  getLocalizedField(cp.bio as Record<string, string> | null, locale) ||
                  getLocalizedField(cp.bio as Record<string, string> | null, "en");

                return (
                  <div key={cp.id} className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-56 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      {cp.photo_url ? (
                        <Image src={cp.photo_url} alt={cp.full_name ?? "Cure Partner"} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                      ) : (
                        <UserCheck className="size-16 text-slate-400" />
                      )}
                      {cp.vip_level && cp.vip_level !== "standard" && (
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase border ${VIP_BADGE[cp.vip_level] ?? ""}`}>
                            {cp.vip_level}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg">{cp.full_name}</h3>
                        <p className="text-sm text-primary">{titleStr}</p>
                      </div>
                      {bioStr && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{bioStr}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {cp.languages?.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                        ))}
                      </div>
                      {cp.service_regions && cp.service_regions.length > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="size-3" />
                          {cp.service_regions.join(" · ")}
                        </p>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground pt-1 border-t">
                        {cp.years_experience && (
                          <span>{cp.years_experience}y experience</span>
                        )}
                        {cp.patient_count !== null && cp.patient_count > 0 && (
                          <span>· {cp.patient_count}+ patients</span>
                        )}
                        {cp.nationality && <span>· {cp.nationality}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <UserCheck className="size-12 mx-auto mb-3 opacity-30" />
              <p>Our Cure Partner profiles are being prepared. Please check back soon.</p>
            </div>
          )}
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-16 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="text-white/80 max-w-lg mx-auto text-lg">
            Tell us about your health goals. We&apos;ll match you with the right Cure Partner and create a personalised Korea healthcare plan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90 transition-colors"
            >
              Submit an Inquiry <ChevronRight className="size-4" />
            </Link>
            <WhatsAppButton />
            <WeChatButton />
          </div>
        </section>
      </div>
    </div>
  );
}
