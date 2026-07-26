import SkeletonPoster from './SkeletonPoster';

export default function SkeletonFeatureReel() {
  return (
    <section className="py-stack-lg bg-background overflow-hidden">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md">
        {/* Skeleton for title */}
        <div className="h-8 w-48 bg-white/10 rounded-full animate-pulse"></div>
      </div>
      <div className="flex gap-gutter px-margin-mobile md:px-margin-desktop overflow-x-auto hide-scrollbar py-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonPoster key={i} className="flex-none w-64 md:w-80" />
        ))}
      </div>
    </section>
  );
}
