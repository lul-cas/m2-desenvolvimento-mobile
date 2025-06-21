import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { getProfile } from "../../services/userService";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { DangerButton, PrimaryButton } from "../../components/Buttons";
import { useNavigation } from "@react-navigation/native";
import UserAvatar from "../../components/userAvatar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  avatarSection: {
    marginRight: 24,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
});

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const uid = auth.currentUser?.uid;
      const token = await auth.currentUser?.getIdToken();

      if (!uid) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      try {
        const data = await getProfile(token, uid);
        setUserInfo(data);
      } catch (error) {
        console.error("Erro ao buscar user info:", error);
        Alert.alert(
          "Erro",
          "Erro ao buscar informações do usuário.\n" +
            (error?.message || "Erro desconhecido"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", "Erro ao realizar logout.");
    }
  };

  if (loading || !userInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#b603fc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarSection}>
          <UserAvatar photoUrl={userInfo.profile_picture} size={100} />
        </View>
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{userInfo.posts_count || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{userInfo.likes_count || 0}</Text>
            <Text style={styles.statLabel}>Curtidas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{userInfo.comments_count || 0}</Text>
            <Text style={styles.statLabel}>Comentários</Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{userInfo.name}</Text>
      <Text style={styles.username}>@{userInfo.username}</Text>

      <PrimaryButton
        text={"Back to Posts"}
        action={() => navigation.navigate("Home")}
      />
      <DangerButton text={"Logout"} action={logout} />
    </View>
  );
};

export default ProfileScreen;
