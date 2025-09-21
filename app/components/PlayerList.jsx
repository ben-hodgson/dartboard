// app/components/PlayerList.jsx

import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { lightColors } from '../../theme';

export default function PlayerList({
  players, currentPlayerIdx, winnerIdx, newPlayerName,
  fontSmall, fontTiny, playerBtnPadV,
  onAddPlayer, onSetNewPlayerName, onRemovePlayer, onSelectPlayer,
  colors,
}) {
  return (
    <View style={{ marginBottom: fontSmall, marginTop: fontTiny }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {players.map((p, i) => (
          <View key={i} style={{flexDirection: 'row', alignItems: 'center', marginRight: fontSmall}}>
            <Pressable
              onPress={() => onSelectPlayer(i)}
              style={{
                backgroundColor: i === currentPlayerIdx
                  ? colors[`marker${(i % 8) + 1}`]
                  : colors.mutedText,
                borderRadius: 18,
                paddingHorizontal: fontSmall+4,
                paddingVertical: playerBtnPadV,
                alignItems: 'center',
                borderWidth: i === currentPlayerIdx ? 2 : 0,
                borderColor: colors.background,
              }}
            >
              <Text style={{
                color: i === currentPlayerIdx ? colors.background : colors.text,
                fontWeight: 'bold',
                fontSize: 15
              }}>
                {p.name}{winnerIdx === i && " 🏆"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onRemovePlayer(i)}
              style={{
                marginLeft: -fontTiny,
                paddingHorizontal: Math.max(4,fontTiny),
                paddingVertical: Math.max(4,fontTiny),
                zIndex: 2,
              }}
              hitSlop={10}
            >
              <Text style={{color: '#c00', fontSize: 25, fontWeight: 'bold'}}>×</Text>
            </Pressable>
          </View>
        ))}
        <TextInput
          style={{
            backgroundColor: colors.surface,
            minWidth:80,
            color:colors.text,
            paddingHorizontal:fontSmall-2,
            paddingVertical:4,
            borderRadius:7,
            borderWidth:1,
            borderColor:colors.background,
            marginLeft:2,
            marginRight:2,
            fontSize: fontSmall
          }}
          placeholder="Add player..."
          placeholderTextColor={colors.mutedText}
          onChangeText={onSetNewPlayerName}
          value={newPlayerName}
          onSubmitEditing={onAddPlayer}
          returnKeyType="done"
        />
        <Pressable
          onPress={onAddPlayer}
          style={{justifyContent:'center',paddingHorizontal:fontTiny+2}}
        >
          <Text style={{color:colors.accent,fontSize:fontSmall}}>＋</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}