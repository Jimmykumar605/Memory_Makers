import LogoLoader from "@/components/LogoLoader";

export default function DashboardLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4">
      <LogoLoader
        size="lg"
        message="Loading Creator Studio workspace..."
        submessage="Syncing inquiries, portfolios & packages"
      />
    </div>
  );
}
