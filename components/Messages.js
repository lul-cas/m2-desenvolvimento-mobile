import React from "react";
import { Text } from "react-native";

export function ErrorMessage({ text }) {
  return <Text style={{ color: "red", marginBottom: 16 }}>{text}</Text>;
}

export function SuccessMessage({ text }) {
  return <Text style={{ color: "green", marginBottom: 16 }}>{text}</Text>;
}
