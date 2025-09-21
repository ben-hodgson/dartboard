// app/components/Dartboard.jsx

import React from 'react';
import { Pressable } from 'react-native';
import Svg, { G, Circle, Path, Text as SvgText } from 'react-native-svg';
import { numbers, SEGMENT_COUNT, segmentPath, polarToCartesian } from '../../helpers';

export default function Dartboard({
  size, players, baseSize, cx, cy,
  r_double_outer, r_double_inner,
  r_outer_single_outer, r_outer_single_inner,
  r_triple_outer, r_triple_inner,
  r_inner_single_outer, r_inner_single_inner,
  r_bull_outer, r_bull_inner,
  handleTap,
  colors
}) {
  const anglePerSegment = (2 * Math.PI) / SEGMENT_COUNT;
  const segmentOffset = -5;
  const startAngle = Math.PI / 2;
  const r_numbers = r_double_outer + (baseSize * 0.053);
  const fontBoardNum = Math.round(baseSize*0.073);

  return (
    <>
      <Svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Circle cx={cx} cy={cy} r={baseSize*0.49} fill={colors.boardBg} />
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
          const doubleColor = isBlack ? colors.boardRed : colors.boardGreen;
          const tripleColor = isBlack ? colors.boardRed : colors.boardGreen;
          const singleColor = isBlack ? colors.boardBlack : colors.boardWhite;
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
                fill={colors.boardWhite}
                fontSize={fontBoardNum}
                fontWeight={num === 20 ? "bold" : "normal"}
                fontFamily='Helvetica'
                textAnchor="middle"
                alignmentBaseline="middle"
                stroke={colors.boardBlack}
                strokeWidth={0.7}
              >
                {num}
              </SvgText>
            </G>
          );
        })}
        <Circle cx={cx} cy={cy} r={r_bull_outer} fill={colors.boardGreen} stroke={colors.boardBlack} strokeWidth={Math.max(2.2, baseSize*0.008)} />
        <Circle cx={cx} cy={cy} r={r_bull_inner} fill={colors.boardRed} stroke={colors.boardBlack} strokeWidth={Math.max(2.2, baseSize*0.008)} />
        {players.map((player, pIdx) =>
          player.hits.map((hit, idx) => (
            <Circle
              key={`${pIdx}-${idx}`}
              cx={hit.x}
              cy={hit.y}
              r={Math.max(baseSize*0.026, 9)}
              fill={colors[`marker${(pIdx % 8) + 1}`]}
              fillOpacity={0.75}
              stroke={colors.markerBorder}
              strokeWidth={2}
            />
          ))
        )}
      </Svg>
      <Pressable
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          backgroundColor: 'transparent',
          zIndex: 2,
        }}
        onPress={handleTap}
      />
    </>
  );
}