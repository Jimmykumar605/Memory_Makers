import LogoLoader from "@/components/LogoLoader";

export default function PhotographerProfileLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4">
      <LogoLoader
        size="lg"
        message="Loading artist portfolio & camera gear locker..."
        submessage="Authenticating high-resolution visual stories"
      />
    </div>
  );
}
