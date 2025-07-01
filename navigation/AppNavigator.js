import React from "react";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainStackNavigator from "./MainStackNavigator";

export default function AppNavigator() {
  const { user } = useAuth();

  return user ? <MainStackNavigator /> : <AuthNavigator />;
}
