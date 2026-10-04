/**
 * Surface card: 12px radius + subtle shadow, with an optional lift on hover.
 */
export default function Card({ children, className = '', hover = true, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-card bg-white shadow-card ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
