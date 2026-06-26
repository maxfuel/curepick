import { Link } from "@/i18n/navigation";
import { getLangLabel } from "@/config/i18n";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Users } from "lucide-react";

interface DoctorCardProps {
  slug: string;
  name: string;
  photoUrl: string | null;
  specialty: string | null;
  experienceYears: number | null;
  languages: string[] | null;
  translations: {
    experience: string;
  };
}

export function DoctorCard({
  slug,
  name,
  photoUrl,
  specialty,
  experienceYears,
  languages,
  translations,
}: DoctorCardProps) {
  return (
    <Link
      href={`/doctors/${slug}`}
      className="block rounded-xl border p-6 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-4">
        {photoUrl ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold">{name}</h3>
          {specialty && (
            <p className="text-sm text-muted-foreground">{specialty}</p>
          )}
          {experienceYears != null && (
            <p className="text-sm text-muted-foreground">
              {translations.experience}
            </p>
          )}
          {languages && languages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {getLangLabel(lang)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
