import { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, createUserWithEmailAndPassword } from "../../firebase";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons";
import { EmailInput, PasswordInput } from "../../components/CustomInputs";
import { regexEmail, regexPassword } from "../../utils/regex";

const styles = StyleSheet.create({
  container: {
    margin: 25,
  },
  title: {
    fontSize: 45,
    textAlign: "center",
    marginVertical: 40,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
});

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const register = async () => {
    if (!email || !password) {
      setErrorMessage("Please, enter your email and password.");
      return;
    }

    if (!regexEmail.test(email)) {
      setErrorMessage("Invalid email address! Please, try again.");
      return;
    }

    if (!regexPassword.test(password)) {
      setErrorMessage(
        "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a symbol. Please try again!",
      );
      return;
    }

    setErrorMessage("");

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  useEffect(() => {
    setErrorMessage("");
  }, [email, password]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Lets get started!</Text>
        <EmailInput value={email} setValue={setEmail} />

        <EmailInput value={email} setValue={setEmail} />

        <PasswordInput value={password} setValue={setPassword} />
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <PrimaryButton
          text={"Sign-up"}
          action={() => {
            register();
          }}
        />

        <Text>Already have an account?</Text>

        <SecondaryButton
          text={"Back to login"}
          action={() => {
            navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
