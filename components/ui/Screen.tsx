import React from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  centered?: boolean;
  contentStyle?: ViewStyle | ViewStyle[];
  scroll?: boolean;
};

export default function Screen({ children, centered = false, contentStyle, scroll = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={[styles.content, centered && styles.centered, contentStyle]}> 
            <View style={styles.container}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.content, centered && styles.centered, contentStyle]}>
            <View style={styles.container}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 20 },
  centered: { justifyContent: "center" },
  container: { gap: 14 },
});
