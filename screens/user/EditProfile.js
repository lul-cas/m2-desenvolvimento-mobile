import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { updateProfile } from "../../services/userService";
import { getAuth } from "firebase/auth";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons";
import { regexPhone, regexUsername } from "../../utils/regex";
import { ErrorMessage, SuccessMessage } from "../../components/Messages";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "start",
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    margin: 40,
  },
});

const EditUserInfoScreen = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const saveUserData = async () => {
    setSuccessMessage("");
    if (!uid) {
      setErrorMessage("User not authenticated.");
      return;
    }

    if (!regexPhone.test(phone)) {
      setErrorMessage("Invalid phone number format.");
      return;
    }

    try {
      let token = await auth.currentUser.getIdToken(true);
      await createOrUpdateUser(token, phone, name);
      setErrorMessage("");
      Alert.alert("Success", "User information saved successfully.");
    } catch (error) {
      setErrorMessage("An error occurred while saving user information.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lets update your data</Text>
      <Text style={styles.label}>New Phone:</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="(99) 99999-9999"
      />

      <Text style={styles.label}>New Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="How do you want to be called?"
      />

      {errorMessage ? <ErrorMessage text={errorMessage} /> : null}

      {successMessage ? <SuccessMessage text={successMessage} /> : null}

      <PrimaryButton text={"Save"} action={saveUserData} />
      <SecondaryButton
        text={"Back to Profile"}
        action={() => {
          navigation.navigate("Profile");
        }}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

export default EditUserInfoScreen;
