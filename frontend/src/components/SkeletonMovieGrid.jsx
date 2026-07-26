import SkeletonPoster from './SkeletonPoster';

export default function SkeletonMovieGrid() {
  return (
    <section className="py-stack-lg bg-background">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md">
        <div className="h-8 w-48 bg-white/10 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-margin-mobile md:px-margin-desktop">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonPoster key={i} className="w-full" />
        ))}
      </div>
    </section>
  );
}
