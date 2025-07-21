const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-primary-900/50 text-primary-300 border-primary-700',
    success: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
    warning: 'bg-amber-900/50 text-amber-300 border-amber-700',
    danger: 'bg-red-900/50 text-red-300 border-red-700'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span className={`${sizes[size]} rounded-full border font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;