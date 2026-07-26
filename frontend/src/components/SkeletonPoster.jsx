export default function SkeletonPoster({ className = '' }) {
  return (
    <div
      className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 animate-pulse ${className}`}
    >
      {/* Placeholder content */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
    </div>
  );
}
