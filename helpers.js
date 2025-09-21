// helpers.js

// --- CONSTANTS
export const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
  3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];
export const SEGMENT_COUNT = 20;
export const COLORS = {
  black: '#231f20',
  white: '#fff',
  green: '#009346',
  red: '#e13029',
  boardBg: '#1a1a1a'
};
export const PLAYER_MARKER_COLORS = [
  '#FFD600', // yellow
  '#00B0FF', // blue
  '#FF5252', // red
  '#00E676', // green
  '#FF80AB', // pink
  '#FFAB40', // orange
  '#A1887F', // brown
  '#B388FF', // purple
];
export const SVG_MARGIN_RATIO = 0.135;
export const NUMBERS_MARGIN_RATIO = 0.093;
export const STARTING_SCORE = 501;

export function getDimensions(availableWidth) {
  const totalMarginRatio = 2 * SVG_MARGIN_RATIO + 2 * NUMBERS_MARGIN_RATIO;
  const baseSize = Math.min(470, availableWidth / (1 + totalMarginRatio));
  const SVG_MARGIN = baseSize * SVG_MARGIN_RATIO;
  const NUMBERS_MARGIN = baseSize * NUMBERS_MARGIN_RATIO;
  const size = baseSize + SVG_MARGIN * 2;
  const cx = size / 2;
  const cy = size / 2;
  return {
    size,
    cx,
    cy,
    r_outer: baseSize * 0.49,
    r_double_outer: baseSize * 0.475,
    r_double_inner: baseSize * 0.43,
    r_outer_single_outer: baseSize * 0.43,
    r_outer_single_inner: baseSize * 0.29,
    r_triple_outer: baseSize * 0.29,
    r_triple_inner: baseSize * 0.235,
    r_inner_single_outer: baseSize * 0.235,
    r_inner_single_inner: baseSize * 0.095,
    r_bull_outer: baseSize * 0.095,
    r_bull_inner: baseSize * 0.045,
    r_numbers_margin: NUMBERS_MARGIN,
    margin: SVG_MARGIN,
    baseSize
  };
}

export function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

export function segmentPath(cx, cy, r1, r2, startRad, endRad) {
  const startOuter = polarToCartesian(cx, cy, r2, startRad);
  const endOuter = polarToCartesian(cx, cy, r2, endRad);
  const startInner = polarToCartesian(cx, cy, r1, endRad);
  const endInner = polarToCartesian(cx, cy, r1, startRad);
  const largeArc = Math.abs(endRad - startRad) > Math.PI ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z'
  ].join(' ');
}

export function getDartScore(hit) {
  if (!hit || hit.section === 'miss') return 0;
  if (hit.section === 'outerBull') return 25;
  if (hit.section === 'innerBull') return 50;
  if (hit.section === 'double') return hit.value * 2;
  if (hit.section === 'triple') return hit.value * 3;
  if (hit.section === 'singleOuter' || hit.section === 'singleInner') return hit.value;
  return 0;
}

export function getHitLabel(hit) {
  if (!hit) return '';
  if (hit.section === 'miss') return 'Miss (0)';
  if (hit.section === 'innerBull') return 'Inner Bull (50)';
  if (hit.section === 'outerBull') return 'Outer Bull (25)';
  if (hit.section === 'double') return `Double ${hit.value} (${hit.value*2})`;
  if (hit.section === 'triple') return `Triple ${hit.value} (${hit.value*3})`;
  if (hit.section === 'singleOuter' || hit.section === 'singleInner') return `Single ${hit.value} (${hit.value})`;
  return 'Miss (0)';
}

export function gameToCSV(players, winnerIdx, startingScore = 501) {
  let rows = [];
  rows.push(["Player", "Throw", "Hit", "Score After"]);
  players.forEach((p, i) => {
    let score = startingScore;
    p.hits.forEach((hit, idx) => {
      let dart = hit.section === "miss" ? 0 : getDartScore(hit);
      score -= dart;
      rows.push([
        p.name,
        idx + 1,
        getHitLabel(hit),
        Math.max(score, 0),
      ]);
    });
    if (i === winnerIdx) {
      rows.push([p.name, "", "WINNER!", ""]);
    }
  });
  // CSV encoding
  return rows.map(r => r.map(cell =>
    `"${String(cell).replace(/"/g, '""')}"`
  ).join(",")).join("\r\n");
}

export function gameToSheet(players, winnerIdx, startingScore = 501) {
  let rows = [];
  rows.push(["Player", "Throw", "Hit", "Score After"]);
  players.forEach((p, i) => {
    let score = startingScore;
    p.hits.forEach((hit, idx) => {
      let dart = hit.section === "miss" ? 0 : getDartScore(hit);
      score -= dart;
      rows.push([
        p.name,
        idx + 1,
        getHitLabel(hit),
        Math.max(score, 0),
      ]);
    });
    if (i === winnerIdx) {
      rows.push([p.name, "", "WINNER!", ""]);
    }
  });
  return rows;
}