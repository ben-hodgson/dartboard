// app/components/PlayerScorePanel.jsx

import React from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { gameToCSV, getHitLabel, STARTING_SCORE } from '../../helpers';
import { downloadTextFile, downloadXLSXFile, saveSharedTextFileAsync, saveSharedXLSXFileAsync } from '../../storage';

export default function PlayerScorePanel({
  player,
  playerScore,
  throwsThisTurn,
  bust,
  winnerIdx,
  players,
  currentPlayerIdx,
  fontMain,
  fontSmall,
  fontTiny,
  baseSize,
  currentPlayerColor,
  colors,
}) {
  const playerHistory = player ? player.hits : [];
  return (
    <View style={{
      width: baseSize + 2 * (baseSize * 0.135),
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: Math.round(fontSmall*1.25),
      marginBottom: fontSmall,
      borderWidth: 1,
      borderColor: colors.background,
      minHeight: Math.max(54, fontMain * 3.15),
      alignSelf:'center'
    }}>
      <Text style={{
        color: currentPlayerColor,
        fontWeight: 'bold',
        fontSize: fontMain,
        marginBottom: fontTiny,
      }}>
        {player
          ? `${player.name}'s Remaining Score: ${playerScore}`
          : 'No player selected'}
      </Text>
      {player &&
        <Text style={{ color: colors.mutedText, fontSize: fontSmall, marginBottom: 4 }}>
          Throws remaining this turn: {3 - throwsThisTurn}
        </Text>
      }
      {winnerIdx !== null && currentPlayerIdx === winnerIdx &&
        <Text style={{ color: '#ff0', fontSize: fontSmall, marginBottom: fontTiny, fontWeight: 'bold' }}>🎉 {players[winnerIdx].name} Wins! 🎯</Text>
      }
      {winnerIdx !== null && (
        <View style={{flexDirection:"row", justifyContent:"center", marginBottom: fontSmall}}>
          <Pressable
            style={{
              backgroundColor: "#006DD2", borderRadius: 6, margin: 2, paddingVertical: 6, paddingHorizontal: 13
            }}
            onPress={async () => {
              const csv = gameToCSV(players, winnerIdx, STARTING_SCORE);
              if (Platform.OS === 'web') {
                downloadTextFile(`dartboard_results.csv`, csv);
              } else {
                await saveSharedTextFileAsync('dartboard_results.csv', csv);
              }
            }}
          ><Text style={{color: "#fff", fontWeight:"bold", fontSize: fontSmall}}>Save CSV</Text></Pressable>
          <Pressable
            style={{
              backgroundColor: "#31b600", borderRadius: 6, margin: 2, paddingVertical: 6, paddingHorizontal: 13
            }}
            onPress={async () => {
              if (Platform.OS === 'web') {
                downloadXLSXFile(`dartboard_results.xlsx`, players, winnerIdx, STARTING_SCORE);
              } else {
                await saveSharedXLSXFileAsync('dartboard_results.xlsx', players, winnerIdx, STARTING_SCORE);
              }
            }}
          ><Text style={{color: "#fff", fontWeight:"bold", fontSize: fontSmall}}>Save XLSX</Text></Pressable>
        </View>
      )}
      {bust && player &&
        <Text style={{ color: '#ff9696', fontSize: fontSmall, marginBottom: 3, fontWeight: 'bold' }}>BUST! Score reset, next player...</Text>
      }
      {player && playerHistory.length === 0 &&
        <Text style={{ color: colors.mutedText, fontSize: fontTiny }}>No throws yet.</Text>
      }
      {player && playerHistory.length > 0 &&
        <ScrollView style={{ maxHeight: Math.max(80, baseSize*0.24) }}>
          {playerHistory.map((hit, idx) => (
            <Text
              key={idx}
              style={{
                color: colors.text,
                fontSize: fontSmall,
                marginBottom: 1,
              }}
            >{`${idx + 1}. ${getHitLabel(hit)}`}</Text>
          ))}
        </ScrollView>
      }
    </View>
  );
}