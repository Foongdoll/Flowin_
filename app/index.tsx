import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // For now, always start at the auth flow.
  return <Redirect href="/(auth)" />;
}
