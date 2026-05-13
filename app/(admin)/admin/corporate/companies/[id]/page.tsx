import { CompanyDetailTabs } from '@/components/admin/corporate/CompanyDetailTabs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyDetailTabs companyId={id} />;
}
