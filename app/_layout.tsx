import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AuthProvider } from "../components/provider/AuthProvider";
import { CalendarProvider } from "../components/provider/CalendarProvider";
import { RecentsProvider } from "../components/provider/RecentsProvider";
import { BoardProvider } from "../components/provider/BoardProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecentsProvider>
        <CalendarProvider>
          <BoardProvider>
            <StatusBar style="light" backgroundColor="#020617" />
            <Stack screenOptions={{ headerShown: false }}>
              {/* Grouped route layouts will handle headers */}
            </Stack>
          </BoardProvider>
        </CalendarProvider>
      </RecentsProvider>
    </AuthProvider>
  );
}
