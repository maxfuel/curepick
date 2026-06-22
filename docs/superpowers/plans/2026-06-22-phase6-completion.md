# Phase 6 Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 6 remaining incomplete items from Phase 6 (User Auth & Inquiry System) that exist in the checklist but are missing from the codebase.

**Architecture:** All features follow the existing Next.js App Router patterns — Server Components fetch data, Client Components handle interactivity, Server Actions mutate data. No new architectural patterns are introduced.

**Tech Stack:** Next.js 15 App Router, Supabase (Auth + DB + Storage), Resend (email), React Hook Form + Zod, next-intl, Tailwind CSS, shadcn/ui

## Global Constraints

- All pages are under `src/app/[locale]/` for i18n routing
- Use `createClient` from `@/lib/supabase/server` in Server Components / Server Actions
- Use `createClient` from `@/lib/supabase/client` in Client Components
- Translation keys must exist in ALL locale files: `messages/en.json`, `messages/ko.json`, `messages/zh.json`, `messages/ja.json`
- TypeScript strict mode — no `any`, no unhandled `null`
- After each task: run `npx tsc --noEmit` to confirm no type errors

---

### Task 1: WhatsApp Button on Inquiry Success Page

**Files:**
- Modify: `src/app/[locale]/inquiry/success/page.tsx`

**Interfaces:**
- Consumes: env var `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g., `+821012345678`) — if not set, button is hidden
- Translation key already present in all locales: `inquiry.whatsapp`

- [ ] **Step 1: Add WhatsApp button to success page**

Replace the content of `SuccessContent` in `src/app/[locale]/inquiry/success/page.tsx`:

```tsx
function SuccessContent() {
  const t = useTranslations("inquiry");
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="size-8 text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{t("successTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("successDescription")}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {t("expectedResponse")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {whatsappUrl && (
            <Button variant="outline" render={<Link href={whatsappUrl} />}>
              <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              {t("whatsapp")}
            </Button>
          )}
          <Button render={<Link href="/" />}>{t("backToHome")}</Button>
        </div>
      </div>
    </div>
  );
}
```

Note: `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER` is read at build time in a Server Component — this is correct since `success/page.tsx` is a Server Component. The `SuccessContent` function is called inside the async Server Component, so it has access to `process.env`.

- [ ] **Step 2: Verify type check passes**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/inquiry/success/page.tsx
git commit -m "feat(F-067): add WhatsApp button to inquiry success page"
```

---

### Task 2: Hospital Staff Email Notification on Inquiry Submission

**Files:**
- Modify: `src/lib/email/send-inquiry-notification.ts`
- Modify: `src/app/api/inquiries/route.ts`

**Interfaces:**
- Consumes: `hospitals.email` field from Supabase (already in schema)
- `sendInquiryNotification` receives optional `hospitalEmail` parameter

- [ ] **Step 1: Update `sendInquiryNotification` to accept and use hospital email**

Replace the entire content of `src/lib/email/send-inquiry-notification.ts`:

```ts
interface InquiryNotificationData {
  name: string;
  email: string;
  message: string;
  hospitalId?: string;
  hospitalEmail?: string;
  hospitalName?: string;
}

export async function sendInquiryNotification(
  data: InquiryNotificationData
) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@curepick.com";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email notification");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const bodyHtml = `
    <h2>New Inquiry Received</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
    ${data.hospitalName ? `<p><strong>Hospital:</strong> ${data.hospitalName}</p>` : ""}
  `;

  const sends = [
    resend.emails.send({
      from: "Curepick <noreply@curepick.com>",
      to: [adminEmail],
      subject: `New Inquiry from ${data.name}`,
      html: bodyHtml,
    }),
  ];

  if (data.hospitalEmail) {
    sends.push(
      resend.emails.send({
        from: "Curepick <noreply@curepick.com>",
        to: [data.hospitalEmail],
        subject: `New Patient Inquiry — ${data.name}`,
        html: `
          <h2>You have a new inquiry from Curepick</h2>
          <p>A patient has expressed interest in your hospital.</p>
          ${bodyHtml}
          <hr/>
          <p>Please log in to your Curepick dashboard to respond.</p>
        `,
      })
    );
  }

  await Promise.allSettled(sends);
}
```

- [ ] **Step 2: Update the inquiries API route to fetch hospital email and pass it**

Replace the POST handler in `src/app/api/inquiries/route.ts` — modify the section after saving to Supabase:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { inquirySchema } from "@/lib/validations/inquiry";
import { sendInquiryNotification } from "@/lib/email/send-inquiry-notification";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, phone, nationality, serviceId, hospitalId, message } =
    parsed.data;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone: phone || null,
    nationality: nationality || null,
    service_id: serviceId || null,
    hospital_id: hospitalId || null,
    message: message || null,
    user_id: user?.id || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch hospital contact info for notification (non-blocking)
  let hospitalEmail: string | undefined;
  let hospitalName: string | undefined;
  if (hospitalId) {
    const { data: hospital } = await supabase
      .from("hospitals")
      .select("email, name")
      .eq("id", hospitalId)
      .single();
    hospitalEmail = hospital?.email ?? undefined;
    hospitalName =
      typeof hospital?.name === "object" && hospital.name !== null
        ? (hospital.name as Record<string, string>)["en"] ?? undefined
        : undefined;
  }

  sendInquiryNotification({ name, email, message, hospitalId, hospitalEmail, hospitalName }).catch(
    console.error
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 3: Verify type check passes**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/send-inquiry-notification.ts src/app/api/inquiries/route.ts
git commit -m "feat(F-066): notify hospital staff on inquiry submission"
```

---

### Task 3: Video Upload in Review Form

**Files:**
- Modify: `src/components/reviews/ReviewForm.tsx`

Note: `src/lib/storage/upload.ts` already handles any file type — no changes needed there.

**Interfaces:**
- Video is uploaded via same `uploadReviewMedia(file, userId)` function
- Video URL is included in `mediaUrls` array passed to `createReview`
- All media stored together in the `media` JSON column

- [ ] **Step 1: Add video state and input to `ReviewForm`**

In `src/components/reviews/ReviewForm.tsx`, add a `video` state alongside `photos`, and add the video upload input. The full updated component:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { createReview } from "@/lib/actions/reviews";
import { uploadReviewMedia } from "@/lib/storage/upload";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

interface ReviewFormProps {
  hospitals: { id: string; name: unknown }[];
  procedures: { id: string; name: unknown; service_id: string | null }[];
  locale: string;
}

export function ReviewForm({ hospitals, procedures, locale }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: ReviewInput) => {
    setIsPending(true);
    setServerError(null);

    try {
      let mediaUrls: string[] = [];
      if (user) {
        const uploads: Promise<string>[] = [
          ...photos.map((file) => uploadReviewMedia(file, user.id)),
          ...(video ? [uploadReviewMedia(video, user.id)] : []),
        ];
        mediaUrls = await Promise.all(uploads);
      }

      const result = await createReview({
        hospitalId: data.hospitalId,
        procedureId: data.procedureId || undefined,
        rating: data.rating,
        title: data.title,
        content: data.content,
        mediaUrls,
      });

      if (result?.error) {
        setServerError(result.error);
        setIsPending(false);
        return;
      }

      router.push("/reviews");
    } catch {
      setServerError("Something went wrong");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="hospitalId" className="text-sm font-medium">
          {t("selectHospital")} *
        </label>
        <select
          id="hospitalId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register("hospitalId")}
        >
          <option value="">{t("selectHospital")}</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {getLocalizedName(h.name, locale)}
            </option>
          ))}
        </select>
        {errors.hospitalId && (
          <p className="text-xs text-destructive">
            {errors.hospitalId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="procedureId" className="text-sm font-medium">
          {t("selectProcedure")}
        </label>
        <select
          id="procedureId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register("procedureId")}
        >
          <option value="">{t("selectProcedure")}</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {getLocalizedName(p.name, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("rating")} *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
            >
              <Star
                className={`size-6 ${
                  star <= (hoverRating || currentRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t("reviewTitle")} *
        </label>
        <Input
          id="title"
          placeholder={t("reviewTitlePlaceholder")}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          {t("content")} *
        </label>
        <textarea
          id="content"
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder={t("contentPlaceholder")}
          aria-invalid={!!errors.content}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="photos" className="text-sm font-medium">
          {t("uploadPhotos")}
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className="text-sm"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).slice(0, 5);
            setPhotos(files);
          }}
        />
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} file(s) selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="video" className="text-sm font-medium">
          {t("uploadVideo")}
        </label>
        <input
          id="video"
          type="file"
          accept="video/*"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setVideo(file);
          }}
        />
        {video && (
          <p className="text-xs text-muted-foreground">{video.name}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("submittingReview") : t("submitReview")}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/reviews/ReviewForm.tsx
git commit -m "feat(F-068): add video upload to review form"
```

---

### Task 4: Category Filter on Reviews List Page

**Files:**
- Modify: `src/app/[locale]/reviews/page.tsx`

**Interfaces:**
- New searchParam: `category?: string` (category slug)
- Fetch categories via `supabase.from("categories").select("id, name, slug")`
- Filter chain: category → services.category_id → procedures.service_id → reviews.procedure_id

- [ ] **Step 1: Replace the entire `src/app/[locale]/reviews/page.tsx`**

```tsx
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/ReviewCard";

interface ReviewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    rating?: string;
    hospital?: string;
    category?: string;
  }>;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export default async function ReviewsPage({
  params,
  searchParams,
}: ReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const supabase = await createClient();

  // Fetch filter options
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("id, name")
    .order("name");

  // Resolve category → procedure IDs for filtering
  let categoryProcedureIds: string[] | null = null;
  if (sp.category) {
    const { data: matchedCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sp.category)
      .single();

    if (matchedCategory) {
      const { data: services } = await supabase
        .from("services")
        .select("id")
        .eq("category_id", matchedCategory.id);

      const serviceIds = (services ?? []).map((s) => s.id);

      if (serviceIds.length > 0) {
        const { data: procedures } = await supabase
          .from("procedures")
          .select("id")
          .in("service_id", serviceIds);
        categoryProcedureIds = (procedures ?? []).map((p) => p.id);
      } else {
        categoryProcedureIds = [];
      }
    }
  }

  let query = supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (sp.rating) {
    query = query.eq("rating", parseInt(sp.rating));
  }
  if (sp.hospital) {
    query = query.eq("hospital_id", sp.hospital);
  }
  if (categoryProcedureIds !== null) {
    if (categoryProcedureIds.length === 0) {
      // No procedures in category → no results
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("procedure_id", categoryProcedureIds);
    }
  }

  const { data: reviews } = await query;

  // Fetch author profiles
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name])
  );

  const reviewsWithAuthors = (reviews ?? []).map((r) => ({
    ...r,
    authorName: profileMap.get(r.user_id) ?? null,
  }));

  return (
    <ReviewsPageContent
      reviews={reviewsWithAuthors}
      categories={categories ?? []}
      hospitals={hospitals ?? []}
      locale={locale}
      selectedRating={sp.rating}
      selectedHospital={sp.hospital}
      selectedCategory={sp.category}
    />
  );
}

function ReviewsPageContent({
  reviews,
  categories,
  hospitals,
  locale,
  selectedRating,
  selectedHospital,
  selectedCategory,
}: {
  reviews: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  }[];
  categories: { id: string; name: unknown; slug: string }[];
  hospitals: { id: string; name: unknown }[];
  locale: string;
  selectedRating?: string;
  selectedHospital?: string;
  selectedCategory?: string;
}) {
  const t = useTranslations("reviews");

  function buildFilterUrl(
    overrides: Partial<{
      rating: string;
      hospital: string;
      category: string;
    }>
  ) {
    const params = new URLSearchParams();
    const rating = overrides.rating ?? selectedRating;
    const hospital = overrides.hospital ?? selectedHospital;
    const category = overrides.category ?? selectedCategory;
    if (rating) params.set("rating", rating);
    if (hospital) params.set("hospital", hospital);
    if (category) params.set("category", category);
    const qs = params.toString();
    return `/reviews${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button render={<Link href="/reviews/write" />}>
          {t("writeReview")}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={selectedRating ?? ""}
          onChange={(e) => {
            window.location.href = buildFilterUrl({
              rating: e.target.value || undefined,
            });
          }}
        >
          <option value="">{t("allRatings")}</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={String(r)}>
              {t("stars", { count: r })}
            </option>
          ))}
        </select>

        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={selectedCategory ?? ""}
          onChange={(e) => {
            window.location.href = buildFilterUrl({
              category: e.target.value || undefined,
            });
          }}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {getLocalizedName(c.name, locale)}
            </option>
          ))}
        </select>

        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={selectedHospital ?? ""}
          onChange={(e) => {
            window.location.href = buildFilterUrl({
              hospital: e.target.value || undefined,
            });
          }}
        >
          <option value="">{t("allHospitals")}</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {getLocalizedName(h.name, locale)}
            </option>
          ))}
        </select>
      </div>

      {reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t("noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Note: The `select` elements use `onChange` with `window.location.href` — this is a Server Component page so we can't use `useRouter`. The filter selects are purely client-side navigation triggers rendered in a Server Component using inline event handlers (this requires the function to be defined in a `"use client"` wrapper, OR use regular `<a>` href navigation). 

Actually, since `ReviewsPageContent` is not a Client Component, we cannot use `onChange` on selects here. **Correct approach:** wrap the filter section in a small `"use client"` component.

Replace the filter section with a separate Client Component:

Create inline within the file — add `"use client"` filter component at the top of the file:

```tsx
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewFilters } from "@/components/reviews/ReviewFilters";
```

Create `src/components/reviews/ReviewFilters.tsx`:

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

interface ReviewFiltersProps {
  categories: { id: string; name: unknown; slug: string }[];
  hospitals: { id: string; name: unknown }[];
  locale: string;
  selectedRating?: string;
  selectedHospital?: string;
  selectedCategory?: string;
}

export function ReviewFilters({
  categories,
  hospitals,
  locale,
  selectedRating,
  selectedHospital,
  selectedCategory,
}: ReviewFiltersProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedRating ?? ""}
        onChange={(e) => updateFilter("rating", e.target.value)}
      >
        <option value="">{t("allRatings")}</option>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={String(r)}>
            {t("stars", { count: r })}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedCategory ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {getLocalizedName(c.name, locale)}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedHospital ?? ""}
        onChange={(e) => updateFilter("hospital", e.target.value)}
      >
        <option value="">{t("allHospitals")}</option>
        {hospitals.map((h) => (
          <option key={h.id} value={h.id}>
            {getLocalizedName(h.name, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

And the simplified `ReviewsPageContent` (server component, no inline handlers):

```tsx
function ReviewsPageContent({
  reviews,
  categories,
  hospitals,
  locale,
  selectedRating,
  selectedHospital,
  selectedCategory,
}: { /* same props as before */ }) {
  const t = useTranslations("reviews");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button render={<Link href="/reviews/write" />}>
          {t("writeReview")}
        </Button>
      </div>

      <ReviewFilters
        categories={categories}
        hospitals={hospitals}
        locale={locale}
        selectedRating={selectedRating}
        selectedHospital={selectedHospital}
        selectedCategory={selectedCategory}
      />

      {reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t("noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add missing translation keys to all locale files**

Add `"allCategories": "All Categories"` to the `reviews` section of:
- `messages/en.json`
- `messages/ko.json`
- `messages/zh.json`
- `messages/ja.json`

English: `"allCategories": "All Categories"`
Korean: `"allCategories": "전체 카테고리"`
Chinese: `"allCategories": "所有类别"`
Japanese: `"allCategories": "すべてのカテゴリ"`

- [ ] **Step 3: Verify type check passes**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/reviews/page.tsx src/components/reviews/ReviewFilters.tsx messages/en.json messages/ko.json messages/zh.json messages/ja.json
git commit -m "feat(F-069): add category filter to reviews list"
```

---

### Task 5: Review Edit Functionality

**Files:**
- Modify: `src/lib/actions/reviews.ts` — add `updateReview` server action
- Create: `src/components/reviews/EditReviewForm.tsx` — edit-only form (title/content/rating only)
- Create: `src/app/[locale]/reviews/[id]/edit/page.tsx` — edit page
- Modify: `src/components/my/MyReviewList.tsx` — add Edit button

**Interfaces:**
- `updateReview(reviewId, data)` → `Promise<{ error?: string; success?: boolean }>`
- `EditReviewForm` props: `reviewId`, `initialRating`, `initialTitle`, `initialContent`, `locale`

- [ ] **Step 1: Add `updateReview` to server actions**

Append to `src/lib/actions/reviews.ts`:

```ts
export async function updateReview(
  reviewId: string,
  data: {
    rating: number;
    title: string;
    content: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: data.rating,
      title: data.title,
      content: data.content,
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/reviews");
  revalidatePath("/my");
  return { success: true };
}
```

- [ ] **Step 2: Create `EditReviewForm` component**

Create `src/components/reviews/EditReviewForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { z } from "zod";
import { updateReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const editReviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

type EditReviewInput = z.infer<typeof editReviewSchema>;

interface EditReviewFormProps {
  reviewId: string;
  initialRating: number;
  initialTitle: string;
  initialContent: string;
  locale: string;
}

export function EditReviewForm({
  reviewId,
  initialRating,
  initialTitle,
  initialContent,
  locale: _locale,
}: EditReviewFormProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditReviewInput>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: initialRating,
      title: initialTitle,
      content: initialContent,
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: EditReviewInput) => {
    setIsPending(true);
    setServerError(null);

    const result = await updateReview(reviewId, data);
    if (result?.error) {
      setServerError(result.error);
      setIsPending(false);
      return;
    }

    router.push(`/reviews/${reviewId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("rating")} *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
            >
              <Star
                className={`size-6 ${
                  star <= (hoverRating || currentRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t("reviewTitle")} *
        </label>
        <Input
          id="title"
          placeholder={t("reviewTitlePlaceholder")}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          {t("content")} *
        </label>
        <textarea
          id="content"
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder={t("contentPlaceholder")}
          aria-invalid={!!errors.content}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("submittingReview") : t("saveReview")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/reviews/${reviewId}`)}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create the edit page**

Create `src/app/[locale]/reviews/[id]/edit/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { EditReviewForm } from "@/components/reviews/EditReviewForm";

interface EditReviewPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("id, rating, title, content, user_id")
    .eq("id", id)
    .single();

  if (!review || review.user_id !== user.id) {
    notFound();
  }

  return <EditReviewPageContent review={review} locale={locale} />;
}

function EditReviewPageContent({
  review,
  locale,
}: {
  review: { id: string; rating: number; title: string; content: string };
  locale: string;
}) {
  const t = useTranslations("reviews");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <EditReviewForm
          reviewId={review.id}
          initialRating={review.rating}
          initialTitle={review.title}
          initialContent={review.content}
          locale={locale}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add Edit button to `MyReviewList`**

In `src/components/my/MyReviewList.tsx`, update the button group. Find the `<div className="flex gap-2">` block and add:

```tsx
<div className="flex gap-2">
  <Button
    variant="ghost"
    size="xs"
    render={<Link href={`/reviews/${review.id}/edit`} />}
  >
    {t("editReview")}
  </Button>
  <Button
    variant="ghost"
    size="xs"
    onClick={() => handleDelete(review.id)}
  >
    {t("deleteReview")}
  </Button>
</div>
```

- [ ] **Step 5: Add missing translation keys to all locale files**

Add to the `reviews` section of all locale files:
- `"editTitle"` — page title for edit page
- `"saveReview"` — save button
- `"cancel"` — cancel button

English:
```json
"editTitle": "Edit Review",
"saveReview": "Save Changes",
"cancel": "Cancel"
```
Korean:
```json
"editTitle": "후기 수정",
"saveReview": "변경 사항 저장",
"cancel": "취소"
```
Chinese:
```json
"editTitle": "编辑评论",
"saveReview": "保存更改",
"cancel": "取消"
```
Japanese:
```json
"editTitle": "レビューを編集",
"saveReview": "変更を保存",
"cancel": "キャンセル"
```

- [ ] **Step 6: Verify type check passes**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/actions/reviews.ts src/components/reviews/EditReviewForm.tsx src/app/[locale]/reviews/[id]/edit/page.tsx src/components/my/MyReviewList.tsx messages/en.json messages/ko.json messages/zh.json messages/ja.json
git commit -m "feat(F-06A): add review edit functionality"
```

---

### Task 6: Supabase DB Trigger for Auto Profile Creation

**Files:**
- Create: `supabase/migrations/20260622_create_profile_trigger.sql`

This trigger must be executed in Supabase Dashboard → SQL Editor.

- [ ] **Step 1: Create the migration SQL file**

Create `supabase/migrations/20260622_create_profile_trigger.sql`:

```sql
-- Trigger function: auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 2: Run the SQL in Supabase Dashboard**

1. Open Supabase Dashboard → project → SQL Editor
2. Paste the SQL above and run it
3. Verify: create a test user and check `profiles` table for the auto-created row

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/migrations/20260622_create_profile_trigger.sql
git commit -m "feat(F-063): add Supabase trigger for auto profile creation"
```

---

### Task 7: Update features-checklist.json

**Files:**
- Modify: `features-checklist.json`

- [ ] **Step 1: Mark all Phase 6 tasks as done and features as done**

Update all Phase 6 features (`F-060` through `F-06A`) in `features-checklist.json`:
- Set every `"done": false` → `"done": true`
- Set every `"status": "pending"` → `"status": "done"`

- [ ] **Step 2: Commit**

```bash
git add features-checklist.json
git commit -m "chore: mark Phase 6 features as complete in checklist"
```

---

### Task 8: Final Commit — All Phase 6 Untracked Files

**Files:** All currently untracked Phase 6 files that are already implemented

- [ ] **Step 1: Stage all untracked Phase 6 files**

```bash
git add src/app/[locale]/login/ src/app/[locale]/signup/ src/app/[locale]/verify-email/ src/app/[locale]/reset-password/ src/app/[locale]/update-password/ src/app/[locale]/inquiry/ src/app/[locale]/my/ src/app/[locale]/reviews/ src/app/[locale]/search/ src/app/api/ src/components/auth/ src/components/inquiry/ src/components/my/ src/components/reviews/ src/components/ui/EvidenceBadge.tsx src/components/ui/FAQSection.tsx src/components/ui/PriceRange.tsx src/components/ui/SearchBar.tsx src/components/ui/accordion.tsx src/components/ui/badge.tsx src/components/ui/card.tsx src/components/ui/input.tsx src/components/ui/popover.tsx src/components/ui/separator.tsx src/hooks/ src/lib/actions/ src/lib/auth/ src/lib/email/ src/lib/storage/ src/lib/utils/ src/lib/validations/
```

- [ ] **Step 2: Verify type check passes one final time**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit everything**

```bash
git commit -m "feat: implement Phase 6 — User Authentication & Inquiry System (F-060~F-06A)"
```

---

## Execution Order

Tasks 1–6 are independent and can be executed in any order. Task 7 (checklist update) and Task 8 (final commit) should run last, after all features are implemented and verified.
