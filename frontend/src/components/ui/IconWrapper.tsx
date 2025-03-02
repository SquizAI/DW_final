import React, { SVGProps } from 'react';

interface IconWrapperProps {
  children: React.ReactElement<SVGProps<SVGSVGElement>>;
  size?: number;
  color?: string;
}

export function IconWrapper({ children, size = 20, color }: IconWrapperProps) {
  if (!React.isValidElement(children)) {
    return null;
  }

  const pixelSize = `${size}px`;
  
  return React.cloneElement(children, {
    width: pixelSize,
    height: pixelSize,
    style: {
      width: pixelSize,
      height: pixelSize,
      minWidth: pixelSize,
      minHeight: pixelSize,
      color: color || 'currentColor',
    }
  });
} 