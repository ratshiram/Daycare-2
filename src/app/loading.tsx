import { Icons } from "@/components/Icons";

export default function Loading() {
  return (
    <div className="loading-screen">
      <Icons.Clock className="animate-spin-css h-12 w-12 text-primary" />
      <span>Loading...</span>
    </div>
  );
}
