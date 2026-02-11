// file: frontend/components/LoadingSpinner.js
export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      ></div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );
}
