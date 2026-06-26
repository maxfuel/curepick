import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

interface CategoryCardProps {
  slug: string;
  name: string;
  imageUrl: string | null;
  servicesLabel: string;
}

export function CategoryCard({
  slug,
  name,
  imageUrl,
  servicesLabel,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md border border-gray-200 ring-0">
        {imageUrl && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{servicesLabel}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
