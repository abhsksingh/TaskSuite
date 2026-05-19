export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#F1F5F9]">{label}</label>
      )}
      <input
        className={`w-full h-10 px-3 bg-[#1A1D27] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all duration-150 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
    </div>
  );
}
