// app/DartboardScoreboard.jsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions, Pressable, Text } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import {
  SEGMENT_COUNT,
  PLAYER_MARKER_COLORS,
  STARTING_SCORE,
  getDimensions,
  getDartScore,
  numbers,
} from '../helpers';

import Dartboard from './components/Dartboard';
import PlayerList from './components/PlayerList';
import PlayerScorePanel from './components/PlayerScorePanel';

import { lightColors, darkColors } from '../theme';

// MAIN CONTAINER COMPONENT
export default function DartboardScoreboard() {
  // --- THEME
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(); // undefined means use system preference
  const colors = (theme ? theme : systemScheme) === 'dark' ? darkColors : lightColors;

  // --- LAYOUT
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const margin = 18;
  const availableWidth = window.width - (insets.left || 0) - (insets.right || 0) - margin;

  // Board Dimensions
  const {
    size, cx, cy,
    r_double_outer, r_double_inner,
    r_outer_single_outer, r_outer_single_inner,
    r_triple_outer, r_triple_inner,
    r_inner_single_outer, r_inner_single_inner,
    r_bull_outer, r_bull_inner,
    baseSize
  } = getDimensions(availableWidth);

  // State
  const [players, setPlayers] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [throwsThisTurn, setThrowsThisTurn] = useState(0);
  const [turnStartHits, setTurnStartHits] = useState([]);
  const [winnerIdx, setWinnerIdx] = useState(null);
  const [bust, setBust] = useState(false);

  // Effects
  useEffect(() => {
    setThrowsThisTurn(0);
    if (players.length > 0)
      setTurnStartHits(players.map(p => p.hits.length));
    setBust(false);
  }, [currentPlayerIdx, players.length]);

  // Derived values
  const currentPlayer = currentPlayerIdx !== null ? players[currentPlayerIdx] : null;
  const currentPlayerColor = currentPlayerIdx !== null
    ? colors[`marker${(currentPlayerIdx % 8) + 1}`]
    : colors.mutedText;
  const playerScore = currentPlayer
    ? STARTING_SCORE - currentPlayer.hits.reduce((sum, h) => sum + getDartScore(h), 0)
    : STARTING_SCORE;
  const currentPlayerIsWinner = currentPlayerIdx !== null && winnerIdx === currentPlayerIdx;
  const playerIsOut = currentPlayerIsWinner || bust;
  const fontMain = Math.round(baseSize*0.046);
  const fontSmall = Math.round(baseSize*0.036);
  const fontTiny = Math.max(12, Math.round(baseSize*0.028));
  const playerBtnPadV = Math.max(4,Math.round(baseSize*0.02));

  // Logic & Handlers (unchanged, but pass colors where needed)
  const handleReset = () => {
    setPlayers([]);
    setThrowsThisTurn(0);
    setCurrentPlayerIdx(null);
    setTurnStartHits([]);
    setWinnerIdx(null);
    setBust(false);
    setNewPlayerName('');
  };
  const handleClearScores = () => {
    setPlayers(players => players.map(p => ({ ...p, hits: [] })));
    setThrowsThisTurn(0);
    setWinnerIdx(null);
    setBust(false);
    setTurnStartHits(players.map(() => 0));
  };
  const handleTap = e => {
    if (currentPlayerIdx === null) return;
    if (throwsThisTurn >= 3 || playerIsOut) return;
    let x = e.nativeEvent.locationX ?? 0;
    let y = e.nativeEvent.locationY ?? 0;
    if ((x === 0 || y === 0) && e.nativeEvent.pageX) {
      const rect = e.target.getBoundingClientRect?.();
      if (rect) {
        x = e.nativeEvent.pageX - rect.left;
        y = e.nativeEvent.pageY - rect.top;
      }
    }
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    let section, wedge, value;
    if (r > baseSize * 0.49) {
      section = 'miss';
      wedge = null;
      value = 0;
    } else {
      const anglePerSegment = (2 * Math.PI) / SEGMENT_COUNT;
      const segmentOffset = -5;
      const startAngleForTap = Math.PI / 2 - anglePerSegment / 2;
      let theta = Math.atan2(dx, -dy);
      if (theta < 0) theta += 2 * Math.PI;
      let angle = (theta - startAngleForTap + 2 * Math.PI) % (2 * Math.PI);
      let seg = Math.floor(angle / anglePerSegment);
      seg = (seg - segmentOffset + SEGMENT_COUNT) % SEGMENT_COUNT;
      wedge = seg;
      if (r <= r_bull_inner) section = 'innerBull';
      else if (r <= r_bull_outer) section = 'outerBull';
      else if (r > r_double_inner && r <= r_double_outer) section = 'double';
      else if (r > r_triple_inner && r <= r_triple_outer) section = 'triple';
      else if (r > r_outer_single_inner && r <= r_outer_single_outer) section = 'singleOuter';
      else if (r > r_inner_single_inner && r <= r_inner_single_outer) section = 'singleInner';
      else section = 'miss';
      value = section === 'miss' ? 0 : numbers[seg];
    }
    const hit = { wedge, section, x, y, value };
    setPlayers(players => players.map((pl, i) =>
      i === currentPlayerIdx
        ? { ...pl, hits: [...pl.hits, hit] }
        : pl
    ));
    const hitsSoFar = [...currentPlayer.hits, hit];
    const newScore = STARTING_SCORE - hitsSoFar.reduce((sum, h) => sum + getDartScore(h), 0);
    if (newScore === 0) {
      setWinnerIdx(currentPlayerIdx);
      setThrowsThisTurn(t => t + 1);
      return;
    }
    if (newScore < 0) {
      setPlayers(players => {
        return players.map((pl, i) => {
          if (i !== currentPlayerIdx) return pl;
          return {
            ...pl,
            hits: pl.hits.slice(0, turnStartHits[i] ?? 0)
          };
        });
      });
      setBust(true);
      setThrowsThisTurn(0);
      setTimeout(() => {
        setBust(false);
        setCurrentPlayerIdx(prevIdx => {
          if (!players.length) return null;
          return (prevIdx + 1) % players.length;
        });
      }, 1200);
      return;
    }
    setThrowsThisTurn(t => {
      if (t === 2) {
        setTimeout(() => {
          setCurrentPlayerIdx(prevIdx => {
            if (!players.length) return null;
            return (prevIdx + 1) % players.length;
          });
        }, 100);
        return 0;
      }
      return t + 1;
    });
  };
  const handleAddPlayer = () => {
    let name = newPlayerName.trim() || `Player ${players.length+1}`;
    setPlayers(ps => {
      const added = [...ps, {name, hits: []}];
      if (ps.length === 0) setCurrentPlayerIdx(0);
      return added;
    });
    setNewPlayerName('');
    setWinnerIdx(null);
    setBust(false);
  };
  const handleRemovePlayer = idx => {
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.filter((p, i) => i !== idx);
      if (newPlayers.length === 0) {
        setCurrentPlayerIdx(null);
      } else if (currentPlayerIdx === idx) {
        setCurrentPlayerIdx(idx === 0 ? 0 : idx - 1);
      } else if (currentPlayerIdx > idx) {
        setCurrentPlayerIdx(currentPlayerIdx - 1);
      }
      if (winnerIdx === idx) setWinnerIdx(null);
      if (bust) setBust(false);
      return newPlayers;
    });
  };
  const handleSelectPlayer = idx => {
    setCurrentPlayerIdx(idx);
    setWinnerIdx(null);
    setBust(false);
  };

  // Render
  return (
    <SafeAreaView style={[styles.outer, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, flexDirection: 'column', minHeight: 0, height: Platform.OS === "web" ? "100vh" : undefined, width: '100%' }}>
          <PlayerList
            players={players}
            currentPlayerIdx={currentPlayerIdx}
            winnerIdx={winnerIdx}
            newPlayerName={newPlayerName}
            fontSmall={fontSmall}
            fontTiny={fontTiny}
            playerBtnPadV={playerBtnPadV}
            onAddPlayer={handleAddPlayer}
            onSetNewPlayerName={setNewPlayerName}
            onRemovePlayer={handleRemovePlayer}
            onSelectPlayer={handleSelectPlayer}
            colors={colors}
          />

          {/* Dartboard */}
          <View style={{
            position: 'relative',
            width: size,
            height: size,
            alignSelf: 'center',
            maxWidth: '100%',
            maxHeight: '100%',
            minWidth: 0,
            minHeight: 0
          }}>
            <Dartboard
              size={size}
              players={players}
              baseSize={baseSize}
              cx={cx}
              cy={cy}
              r_double_outer={r_double_outer}
              r_double_inner={r_double_inner}
              r_outer_single_outer={r_outer_single_outer}
              r_outer_single_inner={r_outer_single_inner}
              r_triple_outer={r_triple_outer}
              r_triple_inner={r_triple_inner}
              r_inner_single_outer={r_inner_single_outer}
              r_inner_single_inner={r_inner_single_inner}
              r_bull_outer={r_bull_outer}
              r_bull_inner={r_bull_inner}
              handleTap={handleTap}
              colors={colors}
            />
          </View>
          <View style={{ height: fontTiny+2 }} />

          <PlayerScorePanel
            player={currentPlayer}
            playerScore={playerScore}
            throwsThisTurn={throwsThisTurn}
            bust={bust}
            winnerIdx={winnerIdx}
            players={players}
            currentPlayerIdx={currentPlayerIdx}
            fontMain={fontMain}
            fontSmall={fontSmall}
            fontTiny={fontTiny}
            baseSize={baseSize}
            currentPlayerColor={currentPlayerColor}
            colors={colors}
          />

          <View style={styles.buttonFooter}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Pressable
                onPress={handleClearScores}
                style={{
                  backgroundColor: colors.surface,
                  paddingVertical: Math.round(fontTiny*0.74),
                  paddingHorizontal: Math.round(fontSmall*1.15),
                  borderRadius: 8,
                  marginBottom: fontSmall,
                  marginRight: fontTiny+1,
                }}
                disabled={players.length === 0}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSmall }}>Clear Scores</Text>
              </Pressable>
              <Pressable
                onPress={handleReset}
                style={{
                  backgroundColor: colors.accent,
                  paddingVertical: Math.round(fontTiny*0.74),
                  paddingHorizontal: Math.round(fontSmall*1.15),
                  borderRadius: 8,
                  marginBottom: fontSmall,
                }}
                disabled={players.length === 0}
              >
                <Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: fontSmall }}>Full Reset</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: colors.text, fontSize: fontSmall, textAlign:'center' }}>
                {players.length === 0
                  ? "Add at least one player to play."
                  : winnerIdx !== null
                    ? `${players[winnerIdx].name} has won!`
                    : currentPlayer
                      ? playerIsOut
                        ? (bust ? "Bust! Next player's turn..." : "You won!")
                        : (throwsThisTurn < 3
                          ? `${currentPlayer.name}, tap the dartboard to drop a marker.`
                          : `Turn complete!`)
                      : "Select a player to play."}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: fontTiny, marginTop: 2, textAlign: 'center' }}>501 rules: Your score counts down from 501. If your score goes below zero, your turn and score resets (bust).</Text>
              <Text style={{ color: colors.mutedText, fontSize: fontTiny, textAlign: 'center' }}>{players.length > 1 && 'Each player gets 3 throws per turn.'}</Text>
              <Pressable
                onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{
                  marginTop: 10,
                  padding: 7,
                  borderRadius: 6,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ color: colors.text }}>{(theme ?? systemScheme) === 'dark' ? "Switch to light mode" : "Switch to dark mode"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    minWidth: 0,
    padding: 0,
  },
  buttonFooter: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: '#222',
    zIndex: 2,
  },
});