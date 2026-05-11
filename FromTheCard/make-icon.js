const sharp = require('sharp');

// SVG icon — a warm recipe card with an amber glow and a small spark
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="52%" r="48%">
      <stop offset="0%" stop-color="#f0c060" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#1a1208" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cardGrad" cx="30%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#f5eed8"/>
      <stop offset="100%" stop-color="#d4c49a"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="-4" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="#1a1208"/>

  <!-- Ambient glow -->
  <ellipse cx="256" cy="270" rx="240" ry="220" fill="url(#glow)"/>

  <!-- Card shadow (back card, tilted) -->
  <g filter="url(#cardShadow)" opacity="0.6">
    <rect x="148" y="148" width="230" height="290" rx="14"
      fill="#c8b882" transform="rotate(-6 256 290)"/>
  </g>

  <!-- Main card -->
  <g filter="url(#cardShadow)">
    <rect x="140" y="130" width="232" height="292" rx="14"
      fill="url(#cardGrad)" transform="rotate(3 256 276)"/>
  </g>

  <!-- Card lines (recipe text feel) -->
  <g transform="rotate(3 256 276)" opacity="0.25">
    <line x1="170" y1="195" x2="352" y2="195" stroke="#8a6a20" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="170" y1="222" x2="320" y2="222" stroke="#8a6a20" stroke-width="2" stroke-linecap="round"/>
    <line x1="170" y1="248" x2="338" y2="248" stroke="#8a6a20" stroke-width="2" stroke-linecap="round"/>
    <line x1="170" y1="274" x2="305" y2="274" stroke="#8a6a20" stroke-width="2" stroke-linecap="round"/>
    <line x1="170" y1="300" x2="325" y2="300" stroke="#8a6a20" stroke-width="2" stroke-linecap="round"/>
    <line x1="170" y1="326" x2="295" y2="326" stroke="#8a6a20" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- Card top accent line -->
  <rect x="140" y="130" width="232" height="6" rx="3"
    fill="#e8a830" opacity="0.9" transform="rotate(3 256 276)"/>

  <!-- Amber spark / glow dot -->
  <circle cx="298" cy="178" r="28" fill="#e8a830" opacity="0.15"/>
  <circle cx="298" cy="178" r="18" fill="#f0c060" opacity="0.25"/>
  <circle cx="298" cy="178" r="10" fill="#f5d070" opacity="0.9"/>
  <circle cx="298" cy="178" r="5"  fill="#fff8e0"/>

  <!-- Small sparkle arms -->
  <g stroke="#f0c060" stroke-width="2" stroke-linecap="round" opacity="0.7">
    <line x1="298" y1="158" x2="298" y2="150"/>
    <line x1="298" y1="198" x2="298" y2="206"/>
    <line x1="278" y1="178" x2="270" y2="178"/>
    <line x1="318" y1="178" x2="326" y2="178"/>
    <line x1="284" y1="164" x2="278" y2="158"/>
    <line x1="312" y1="192" x2="318" y2="198"/>
    <line x1="312" y1="164" x2="318" y2="158"/>
    <line x1="284" y1="192" x2="278" y2="198"/>
  </g>
</svg>`;

async function makeIcon(size, filename) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/${filename}`);
  console.log(`Created ${filename}`);
}

(async () => {
  await makeIcon(512, 'icon-512.png');
  await makeIcon(192, 'icon-192.png');
  await makeIcon(180, 'apple-touch-icon.png');
  console.log('All icons done.');
})();
