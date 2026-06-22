import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceRange } from "@/components/ui/PriceRange";
import Image from "next/image";
import { MapPin, Users, Activity, Clock } from "lucide-react";

interface HospitalCardProps {
  slug: string;
  name: string;
  city: string | null;
  logoUrl: string | null;
  costMin: number | null;
  costMax: number | null;
  costCurrency: string | null;
  annualVolume: number | null;
  specialistCount: number | null;
  waitingTimeDays: number | null;
  evidenceScore: number | null;
  languages: string[] | null;
  translations: {
    viewHospital: string;
    annualVolume: string;
    specialists: string;
    waitingDays: string;
    evidenceScore: string;
  };
}

export function HospitalCard({
  slug,
  name,
  city,
  logoUrl,
  costMin,
  costMax,
  costCurrency,
  annualVolume,
  specialistCount,
  waitingTimeDays,
  evidenceScore,
  languages,
  translations,
}: HospitalCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          {logoUrl && (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={logoUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="truncate">{name}</CardTitle>
            {city && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {city}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <PriceRange
          costMin={costMin}
          costMax={costMax}
          currency={costCurrency}
        />

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {annualVolume != null && (
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              <span>{translations.annualVolume}</span>
            </div>
          )}
          {specialistCount != null && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{translations.specialists}</span>
            </div>
          )}
          {waitingTimeDays != null && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{translations.waitingDays}</span>
            </div>
          )}
        </div>

        {evidenceScore != null && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {translations.evidenceScore}: {evidenceScore}/10
            </Badge>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {languages.map((lang) => (
              <Badge key={lang} variant="outline">
                {lang}
              </Badge>
            ))}
          </div>
        )}

        <Link
          href={`/hospitals/${slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          {translations.viewHospital} &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
