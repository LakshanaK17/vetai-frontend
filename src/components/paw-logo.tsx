export function PawLogo() {
  return (
    <span
      className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-soft"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="6" cy="9" rx="2" ry="2.6" />
        <ellipse cx="10.5" cy="6" rx="2" ry="2.6" />
        <ellipse cx="15.5" cy="6" rx="2" ry="2.6" />
        <ellipse cx="20" cy="9" rx="2" ry="2.6" />
        <path d="M13 11c3.5 0 6 3 6 6a3 3 0 0 1-3 3c-1 0-1.6-.5-3-.5s-2 .5-3 .5a3 3 0 0 1-3-3c0-3 2.5-6 6-6z" />
      </svg>
    </span>
  );
}
