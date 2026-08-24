import { redirect } from 'next/navigation';

interface LegacyBusinessPageProps {
  params: Promise<{ slug: string }>;
}

/** Legacy route — send traffic to the primary business profile. */
export default async function LegacyBusinessDetailPage({ params }: LegacyBusinessPageProps) {
  const { slug } = await params;
  redirect(`/business/${slug}`);
}
