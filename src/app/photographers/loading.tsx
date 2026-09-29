import LogoLoader from "@/components/LogoLoader";

export default function PhotographersLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
      <LogoLoader
        size="lg"
        message="Curating master photographers across Punjab, Haryana, Rajasthan, Delhi NCR..."
        submessage="Filtering verified portfolios & INR packages"
      />
    </div>
  );
}
