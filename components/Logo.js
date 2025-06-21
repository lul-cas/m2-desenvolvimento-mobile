import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    resizeMode: "contain",
  },
});

export default function Logo() {
  return (
    <Image source={require("../assets/fitbookpng.png")} style={styles.logo} />
  );
}
