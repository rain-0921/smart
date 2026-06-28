import { useState } from 'react';
import { token, fontDisplay } from '../../theme';
import { photoUrl, initials } from '../../utils';

export default function Avatar({ name, src, size = 38 }) {
  const [broken, setBroken] = useState(false);
  const url = photoUrl(src);
  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setBroken(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `1px solid ${token.line}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: token.brassSoft,
        color: token.brassDeep,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fontDisplay,
        fontWeight: 600,
        fontSize: size * 0.38,
        border: `1px solid ${token.brass}33`,
      }}
    >
      {initials(name)}
    </div>
  );
}