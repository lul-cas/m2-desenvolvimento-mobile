import { TouchableOpacity, Text, StyleSheet } from "react-native";

export function PrimaryButton({ action, text }) {
  return (
    <TouchableOpacity
      onPress={action}
      style={[styles.button, styles.primaryButton]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ action, text }) {
  return (
    <TouchableOpacity
      onPress={action}
      style={[styles.button, styles.secondaryButton]}
    >
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

export function DangerButton({ action, text }) {
  return (
    <TouchableOpacity
      onPress={action}
      style={[styles.button, styles.dangerButton]}
    >
      <Text style={[styles.buttonText]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 15,
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: "#b603fc",
  },
  secondaryButton: {
    borderColor: "#b603fc",
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: "#b603fc",
  },
  dangerButton: {
    backgroundColor: "red",
  },
});
