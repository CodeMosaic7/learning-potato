const Input = ({ label, placeholder, type = 'text', value, onChange, className = '' }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;