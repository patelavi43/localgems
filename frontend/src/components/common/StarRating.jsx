export default function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size] || 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${sizeClass} transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <svg viewBox="0 0 24 24" className={`${sizeClass} ${filled || half ? 'text-yellow-400' : 'text-gem-700'}`} fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'} stroke="currentColor" strokeWidth={filled || half ? 0 : 1.5}>
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#fbbf24"/>
                  <stop offset="50%" stopColor="transparent"/>
                </linearGradient>
              </defs>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
