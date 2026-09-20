import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', // Vibrant Orange
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo Royal
  'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', // Sky Blue
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald Green
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Rose Pink
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple Velvet
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Teal Wave
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Amber Sun
  'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)'  // Crimson Ruby
];

export function isDummyPhoto(url) {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (!clean || clean === 'null' || clean === 'undefined' || clean === 'none') return true;
  if (clean.includes('unsplash.com')) return true;
  if (clean.includes('placeholder')) return true;
  if (clean.includes('dummy')) return true;
  if (clean.includes('example.com')) return true;
  return false;
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradientForName(name) {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export default function ResidentAvatar({
  name = '',
  photoUrl = '',
  size = 48,
  borderRadius = '14px',
  border = '2px solid rgba(0,0,0,0.06)',
  className = '',
  style = {}
}) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const backgroundGradient = getGradientForName(name);

  useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  // Strict check for legitimate uploaded resident photo
  const hasValidPhoto =
    Boolean(photoUrl) &&
    typeof photoUrl === 'string' &&
    !isDummyPhoto(photoUrl) &&
    !imageError;

  const fontPixelSize = Math.max(10, Math.round(size * 0.38));
  const iconPixelSize = Math.max(12, Math.round(size * 0.48));

  if (hasValidPhoto) {
    return (
      <img
        src={photoUrl}
        alt={name || 'Resident'}
        onError={() => setImageError(true)}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius,
          objectFit: 'cover',
          border,
          display: 'block',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  return (
    <div
      className={className}
      title={name || 'Resident'}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius,
        background: backgroundGradient,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${fontPixelSize}px`,
        letterSpacing: '0.04em',
        border,
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        userSelect: 'none',
        ...style
      }}
    >
      {initials ? initials : <User size={iconPixelSize} color="#ffffff" strokeWidth={2.2} />}
    </div>
  );
}
