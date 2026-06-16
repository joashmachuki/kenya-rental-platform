import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: { width: 32, height: 32, fontSize: 'text-lg' },
    md: { width: 40, height: 40, fontSize: 'text-xl' },
    lg: { width: 48, height: 48, fontSize: 'text-2xl' }
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={width}
        height={height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 4L4 20H12V40H20V28H28V40H36V20H44L24 4Z"
          fill="url(#gradient)"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="18" r="4" fill="white" />
        <defs>
          <linearGradient id="gradient" x1="4" y1="4" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22c55e" />
            <stop offset="1" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${fontSize} font-bold text-white tracking-tight`}>
            Keja<span className="text-green-400">Find</span>
          </span>
          <span className="text-[10px] text-dark-500 tracking-wider uppercase">
            Kenya Rentals
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
