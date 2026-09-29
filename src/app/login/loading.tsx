import LogoLoader from "@/components/LogoLoader";

export default function LoginLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4">
      <LogoLoader
        size="lg"
        message="Connecting to MemoryMakers..."
        submessage="Photographer & Client Portal"
      />
    </div>
  );
}
