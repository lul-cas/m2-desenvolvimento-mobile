import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { auth } from "../firebase";
import { getProfile } from "../services/userService";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Logo from "../components/Logo";
import UserAvatar from "../components/userAvatar";

const styles = StyleSheet.create({
  titleLogoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 30,
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 20,
  },
  safeArea: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: "#b603fc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    right: 20, // mover mais à direita
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let token = await currentUser.getIdToken();
        const profile = await getProfile(token, currentUser.uid);

        if (!profile) {
          navigation.navigate("NewUserInfo");
        } else {
          setUserProfile(profile);
        }

        setLoading(false);
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b603fc" />
          <Text>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.titleLogoContainer}>
          <Logo />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Conteúdo de posts aqui futuramente */}
      </ScrollView>

      {userProfile && (
        <View style={styles.footer}>
          <UserAvatar
            photoUrl={userProfile.profile_picture}
            size={60}
            redirect={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
