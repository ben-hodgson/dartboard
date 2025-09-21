import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { G, Circle, Path, Text as SvgText } from 'react-native-svg';
import DartboardScoreboard from './DartboardScoreboard';

const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
  3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

const SEGMENT_COUNT = 20;
const COLORS = {
  black: '#231f20',
  white: '#fff',
  green: '#009346',
  red: '#e13029',
  boardBg: '#1a1a1a'
};
const SVG_MARGIN = 36; // <= Increase this if your numbers still get clipped

const getDimensions = () => {
  // Board diameter: fit to window minus some for margin for easier centering
  const baseSize = Math.min(Dimensions.get('window').width, 380);
  const size = baseSize + SVG_MARGIN * 2; // EXPAND for numbers
  const cx = size / 2,
        cy = size / 2;
  const boardRadius = baseSize / 2;
  // All radii now based on "boardRadius", not half of SVG size
  return {
    size,
    cx,
    cy,
    r_outer: boardRadius * 0.98,
    r_double_outer: boardRadius * 0.95,
    r_double_inner: boardRadius * 0.86,
    r_outer_single_outer: boardRadius * 0.86,
    r_outer_single_inner: boardRadius * 0.58,
    r_triple_outer: boardRadius * 0.58,
    r_triple_inner: boardRadius * 0.47,
    r_inner_single_outer: boardRadius * 0.47,
    r_inner_single_inner: boardRadius * 0.19,
    r_bull_outer: boardRadius * 0.19,
    r_bull_inner: boardRadius * 0.09,
    r_numbers_margin: 18, // number offset outside double ring
  }
};

function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function segmentPath(cx, cy, r1, r2, startRad, endRad) {
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

export default function App() {
  // Optionally, you can render both the static board and the scoreboard if needed
  // Otherwise, just render the scoreboard as shown below:

  return (
    <View style={styles.container}>
      <DartboardScoreboard />
    </View>
  );

  /* To show the original board, replace above with:
  const {
    size, cx, cy,
    r_double_outer, r_double_inner,
    r_outer_single_outer, r_outer_single_inner,
    r_triple_outer, r_triple_inner,
    r_inner_single_outer, r_inner_single_inner,
    r_bull_outer, r_bull_inner,
    r_numbers_margin,
    r_outer,
  } = getDimensions();
  const anglePerSegment = (2 * Math.PI) / SEGMENT_COUNT;
  const segmentOffset = -5;
  const startAngle = Math.PI / 2;
  const r_numbers = r_double_outer + r_numbers_margin;
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r_outer} fill={COLORS.boardBg} />
        {numbers.map((num, i) => {
          const segmentIndex = (i + segmentOffset + SEGMENT_COUNT) % SEGMENT_COUNT;
          const segmentCenterAngle = startAngle + segmentIndex * anglePerSegment;
          const segmentStartAngle = segmentCenterAngle - anglePerSegment / 2;
          const segmentEndAngle = segmentCenterAngle + anglePerSegment / 2;
          const isBlack = i % 2 === 0;
          const pathDouble = segmentPath(cx, cy, r_double_inner, r_double_outer, segmentStartAngle, segmentEndAngle);
          const pathOuterSingle = segmentPath(cx, cy, r_outer_single_inner, r_outer_single_outer, segmentStartAngle, segmentEndAngle);
          const pathTriple = segmentPath(cx, cy, r_triple_inner, r_triple_outer, segmentStartAngle, segmentEndAngle);
          const pathInnerSingle = segmentPath(cx, cy, r_inner_single_inner, r_inner_single_outer, segmentStartAngle, segmentEndAngle);
          const doubleColor = isBlack ? COLORS.red : COLORS.green;
          const tripleColor = isBlack ? COLORS.red : COLORS.green;
          const singleColor = isBlack ? COLORS.black : COLORS.white;
          const { x, y } = polarToCartesian(cx, cy, r_numbers, segmentCenterAngle);
          return (
            <G key={i}>
              <Path d={pathDouble} fill={doubleColor} />
              <Path d={pathOuterSingle} fill={singleColor} />
              <Path d={pathTriple} fill={tripleColor} />
              <Path d={pathInnerSingle} fill={singleColor} />
              <SvgText
                x={x}
                y={y + 4}
                fill={COLORS.white}
                fontSize={18}
                fontWeight={num === 20 ? "bold" : "normal"}
                textAnchor="middle"
                alignmentBaseline="middle"
                stroke={COLORS.black}
                strokeWidth={0.7}
              >
                {num}
              </SvgText>
            </G>
          );
        })}
        <Circle cx={cx} cy={cy} r={r_bull_outer} fill={COLORS.green} stroke={COLORS.black} strokeWidth={2.2} />
        <Circle cx={cx} cy={cy} r={r_bull_inner} fill={COLORS.red} stroke={COLORS.black} strokeWidth={2.2} />
      </Svg>
    </View>
  );
  */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.boardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});