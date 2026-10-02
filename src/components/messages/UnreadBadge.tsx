"use client";

export function UnreadBadge({ userId }: { userId?: string }) {
  const count: number = 3;

  if (!userId || count === 0) return null;

  return (
    <div className="absolute right-2 bg-blue-500 text-white rounded-full min-w-[18px] h-4.5 flex items-center justify-center text-[10px] font-bold px-1 dark:bg-blue-600">
      {count > 99 ? "99+" : count}
    </div>
  );
}
