import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

/** A QR code drawn as one SVG path, crisp at any size on a projector. */
export default function QrCode({ value, className, color = '#15171a' }: { value: string; className?: string; color?: string }) {
  const { size, d } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { size: n, d: path };
  }, [value]);
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className={className} role="img" aria-label={`QR code for ${value}`} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
      <path d={d} fill={color} />
    </svg>
  );
}
