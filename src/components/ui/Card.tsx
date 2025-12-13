interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-xl border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export default Card;
