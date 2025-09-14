import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { CalendarProvider } from "../components/provider/CalendarProvider";
import { RecentsProvider } from "../components/provider/RecentsProvider";
import { BoardProvider } from "../components/provider/BoardProvider";

export default function RootLayout() {
  return (
    <RecentsProvider>
      <CalendarProvider>
        <BoardProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Grouped route layouts will handle headers */}
          </Stack>
        </BoardProvider>
      </CalendarProvider>
    </RecentsProvider>
  );
}
