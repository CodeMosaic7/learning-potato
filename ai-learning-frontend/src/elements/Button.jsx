const Button = ({ variant = 'primary', size = 'md', children, onClick, disabled, className = '', type = 'button' }) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-primary-500',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-dark-200 border border-dark-600 hover:border-dark-500 shadow-md hover:shadow-lg',
    ghost: 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 focus:ring-primary-400',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-emerald-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;