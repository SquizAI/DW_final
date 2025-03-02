import React, { SVGProps } from 'react';

// Updated IconWrapper to use a numeric 'size' prop (in pixels) to avoid calc expressions

interface IconWrapperProps {
  children: React.ReactElement<SVGProps<SVGSVGElement>>;
  size?: number;
  color?: string;
}

export function IconWrapper({ children, size = 20, color }: IconWrapperProps) {
  if (!React.isValidElement(children)) {
    return null;
  }

  return React.cloneElement(children, {
    style: {
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      color: color || 'currentColor',
    }
  } as SVGProps<SVGSVGElement>);
}

export default IconWrapper;