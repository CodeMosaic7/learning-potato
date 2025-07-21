const Card = ({ children, className = '', hover = false, glass = false }) => {
  const baseClasses = 'rounded-2xl shadow-xl transition-all duration-300';
  const backgroundClasses = glass 
    ? 'glass-effect' 
    : 'bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700';
  const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-[1.02] hover:border-primary-500/50' : '';
  
  return (
    <div className={`${baseClasses} ${backgroundClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;