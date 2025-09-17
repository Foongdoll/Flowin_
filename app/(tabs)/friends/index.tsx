import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";

import { palette } from "../../../components/ui/theme";
import { useFriends } from "../../../components/provider/FriendsProvider";

export default function FriendsIndex() {



  const { friends, loading, addFriend, removeFriend } = useFriends();



  const [q, setQ] = useState("");



  const normalized = q.trim();



  const lowered = normalized.toLowerCase();



  const filtered = useMemo(() => {



    if (!lowered) return friends;



    return friends.filter((f) => f.name.toLowerCase().includes(lowered));



  }, [friends, lowered]);



  const hasDuplicate = friends.some((f) => f.name.toLowerCase() === lowered);



  const canAdd = normalized.length > 0 && !hasDuplicate;



  const onAdd = async () => {



    try {



      const friend = await addFriend(normalized);



      setQ("");



      Alert.alert("친구 추가", friend.name + " 님을 친구로 추가했습니다.");



    } catch (error) {



      const message = error instanceof Error ? error.message : "친구를 추가하지 못했습니다.";



      Alert.alert("오류", message);



    }



  };



  const confirmRemove = (id: string, name: string) => {



    Alert.alert("삭제", name + " 님을 친구 목록에서 삭제할까요?", [



      { text: "취소", style: "cancel" },



      {



        text: "삭제",



        style: "destructive",



        onPress: () => {



          removeFriend(id).catch(() => {



            Alert.alert("오류", "친구를 삭제하지 못했습니다.");



          });



        },



      },



    ]);



  };



  const emptyMessage = loading ? "친구를 불러오는 중입니다..." : "등록된 친구가 없습니다. 검색 후 추가해 보세요.";



  const renderEmpty = useCallback(() => <Text style={styles.empty}>{emptyMessage}</Text>, [emptyMessage]);



  return (



    <View style={styles.container}>



      <HeaderBar title="친구" subtitle="대화하기" />



      <View style={styles.body}>



        <SearchInput value={q} onChangeText={setQ} placeholder="친구 검색" />



        {canAdd ? (



          <Pressable style={styles.addAction} onPress={onAdd}>



            <Ionicons name="person-add" size={18} color={palette.textPrimary} />



            <Text style={styles.addText}>"{normalized}" 친구로 추가</Text>



          </Pressable>



        ) : null}



        {!canAdd && normalized.length > 0 && hasDuplicate ? (



          <Text style={styles.helper}>이미 같은 이름의 친구가 존재합니다.</Text>



        ) : null}



        <FlatList



          data={filtered}



          keyExtractor={(item) => item.id}



          renderItem={({ item }) => (



            <ListItem



              title={item.name}



              subtitle="대화를 시작하려면 탭하세요"



              onPress={() => router.push({ pathname: "/(tabs)/friends/[id]", params: { id: item.id } })}



              onLongPress={() => confirmRemove(item.id, item.name)}



              right={<Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.textMuted} />}



            />



          )}



          extraData={emptyMessage}



          ListEmptyComponent={renderEmpty}



          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}



          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}



        />



      </View>



    </View>



  );



}



const styles = StyleSheet.create({



  container: { flex: 1, backgroundColor: palette.background },



  body: { padding: 20, gap: 16 },



  empty: { textAlign: "center", color: palette.textMuted, paddingVertical: 32 },



  addAction: {



    flexDirection: "row",



    alignItems: "center",



    gap: 8,



    paddingHorizontal: 14,



    paddingVertical: 10,



    borderRadius: 999,



    borderWidth: 1,



    borderColor: palette.cardBorder,



    backgroundColor: "rgba(124, 92, 255, 0.12)",



  },



  addText: { color: palette.textPrimary, fontWeight: "700" },



  helper: { color: palette.textMuted, fontSize: 12, marginTop: -4, marginBottom: -4 },



});



