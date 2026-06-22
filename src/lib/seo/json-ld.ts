import { getLocalizedField } from "@/lib/utils/i18n-field";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface HospitalJsonLdInput {
  slug: string;
  name: unknown;
  description: unknown;
  address: unknown;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
}

export function buildHospitalJsonLd(hospital: HospitalJsonLdInput, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: getLocalizedField(hospital.name, locale),
    description: getLocalizedField(hospital.description, locale),
    url: `${SITE_URL}/${locale}/hospitals/${hospital.slug}`,
    ...(hospital.logo_url && { logo: hospital.logo_url }),
    ...(hospital.phone && { telephone: hospital.phone }),
    ...(hospital.email && { email: hospital.email }),
    ...(hospital.website && { sameAs: hospital.website }),
    address: {
      "@type": "PostalAddress",
      streetAddress: getLocalizedField(hospital.address, locale),
      addressLocality: hospital.city ?? "",
    },
  };
}

export interface PhysicianJsonLdInput {
  slug: string;
  name: unknown;
  specialty: unknown;
  photo_url: string | null;
}

export function buildPhysicianJsonLd(
  doctor: PhysicianJsonLdInput,
  hospitalName: string,
  locale: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: getLocalizedField(doctor.name, locale),
    url: `${SITE_URL}/${locale}/doctors/${doctor.slug}`,
    ...(doctor.photo_url && { image: doctor.photo_url }),
    medicalSpecialty: getLocalizedField(doctor.specialty, locale),
    worksFor: {
      "@type": "MedicalOrganization",
      name: hospitalName,
    },
  };
}

export interface FaqJsonLdInput {
  question: unknown;
  answer: unknown;
}

export function buildFaqJsonLd(faqs: FaqJsonLdInput[], locale: string): object | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: getLocalizedField(faq.question, locale),
      acceptedAnswer: {
        "@type": "Answer",
        text: getLocalizedField(faq.answer, locale),
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url?: string;  // omit for the last (current) item
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}
