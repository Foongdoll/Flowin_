import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, TextInput } from "react-native";
import { useFonts } from "expo-font";
import { AuthProvider } from "../components/provider/AuthProvider";
import { CalendarProvider } from "../components/provider/CalendarProvider";
import { RecentsProvider } from "../components/provider/RecentsProvider";
import { BoardProvider } from "../components/provider/BoardProvider";
import { NotesProvider } from "../components/provider/NotesProvider";
import { DocsProvider } from "../components/provider/DocsProvider";
import { FriendsProvider } from "../components/provider/FriendsProvider";
import tokens from "../theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op if splash screen already hidden */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Dongle-Light": require("../assets/fonts/Dongle-Light.ttf"),
    "Dongle-Regular": require("../assets/fonts/Dongle-Regular.ttf"),
    "Dongle-Bold": require("../assets/fonts/Dongle-Bold.ttf"),
  });

  React.useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  React.useEffect(() => {
    if (!fontsLoaded) return;

    setGlobalFont(tokens.typography.fontFamily.regular);
    SplashScreen.hideAsync().catch(() => {
      /* safely ignore */
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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

function setGlobalFont(defaultFont: string) {
  const baseTextStyle = { fontFamily: defaultFont, letterSpacing: 0.2 } as const;
  const baseInputStyle = { fontFamily: defaultFont } as const;

  Text.defaultProps = {
    ...(Text.defaultProps ?? {}),
    style: [baseTextStyle, Text.defaultProps?.style],
    allowFontScaling: Text.defaultProps?.allowFontScaling ?? false,
  };

  TextInput.defaultProps = {
    ...(TextInput.defaultProps ?? {}),
    style: [baseInputStyle, TextInput.defaultProps?.style],
    allowFontScaling: TextInput.defaultProps?.allowFontScaling ?? false,
  };
}
