import { TextInput, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderColor: "#c9c9c9",
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    fontSize: 20,
    color: "black",
    marginVertical: 15,
  },
});

export function EmailInput({ placeholder = "E-mail", value, setValue }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="black"
      style={styles.input}
      inputMode="email"
      autoCapitalize="none"
      onChangeText={setValue}
      value={value}
    />
  );
}

export function PasswordInput({ placeholder = "Password", value, setValue }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="black"
      style={styles.input}
      autoCapitalize="none"
      secureTextEntry={true}
      onChangeText={setValue}
      value={value}
    />
  );
}

export function CustomTextInput({ placeholder, value, setValue }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="black"
      style={styles.input}
      onChangeText={setValue}
      value={value}
    />
  );
}
