import { UserDetailTabs } from '@/components/admin/users/UserDetailTabs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            User Details
          </h1>
          <p
            className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View and manage user account details and permissions.
          </p>
        </div>
      </div>

      <UserDetailTabs userId={id} />
    </div>
  );
}
