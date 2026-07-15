function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-black/10 dark:bg-white/10 rounded ${className ?? ""}`}
    />
  );
}

export default Skeleton;
