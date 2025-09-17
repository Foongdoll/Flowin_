import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AuthProvider } from "../components/provider/AuthProvider";
import { CalendarProvider } from "../components/provider/CalendarProvider";
import { RecentsProvider } from "../components/provider/RecentsProvider";
import { BoardProvider } from "../components/provider/BoardProvider";
import { NotesProvider } from "../components/provider/NotesProvider";
import { DocsProvider } from "../components/provider/DocsProvider";
import { FriendsProvider } from "../components/provider/FriendsProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecentsProvider>
        <NotesProvider>
          <DocsProvider>
            <FriendsProvider>
              <CalendarProvider>
                <BoardProvider>
                  <StatusBar style="light" backgroundColor="#020617" />
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Grouped route layouts will handle headers */}
                  </Stack>
                </BoardProvider>
              </CalendarProvider>
            </FriendsProvider>
          </DocsProvider>
        </NotesProvider>
      </RecentsProvider>
    </AuthProvider>
  );
}
