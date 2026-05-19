const variants = {
  primary: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] active:scale-[0.97]',
  secondary: 'bg-[#22263A] text-[#F1F5F9] border border-[#3D4266] hover:bg-[#2D3248] active:scale-[0.97]',
  ghost: 'bg-transparent text-[#94A3B8] hover:text-white hover:bg-[#22263A] active:scale-[0.97]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-100 focus:outline-none focus:ring-[3px] focus:ring-[#6366F1]/40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
