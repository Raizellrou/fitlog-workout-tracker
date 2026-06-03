/** Per-screen container: consistent horizontal padding + bottom breathing room. */
export default function AppScreen({ children, className = '' }) {
  return <div className={`px-5 pb-6 animate-fade-in ${className}`}>{children}</div>;
}
