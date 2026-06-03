/** Full-width violet-gradient CTA with glow. */
export default function GradientButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`w-full accent-gradient glow-accent text-white font-semibold text-[16px] rounded-full py-4 active:scale-[0.98] transition-transform disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
