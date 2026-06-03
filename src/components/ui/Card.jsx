/** Base elevated surface: border + radius + padding. */
export default function Card({ className = '', children, ...rest }) {
  return (
    <div className={`card-surface p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}
