import React from 'react';
import { Stack } from 'expo-router';
import { ParallaxBackground } from '../../../components/ui/ParallaxBackground';
import tokens from '../../../theme/tokens';

export default function CalendarStackLayout() {
  return (
    <ParallaxBackground>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="view" />
        <Stack.Screen
          name="edit"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </ParallaxBackground>
  );
}
