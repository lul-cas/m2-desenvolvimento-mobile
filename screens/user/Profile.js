import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
} from "react-native";
import { getProfile } from "../../services/userService";
import {
  getPosts,
  getPost,
  likePost,
  commentPost,
  deletePost,
} from "../../services/postService";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { PrimaryButton, DangerButton } from "../../components/Buttons";
import UserAvatar from "../../components/userAvatar";
import { formatPhone } from "../../utils/format";
import { getReadableLocation } from "../../services/locationService";
import EvilIcons from "@expo/vector-icons/EvilIcons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f4f4f4",
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
  },
  gallery: {
    marginTop: 20,
  },
  image: {
    width: Dimensions.get("window").width / 3 - 8,
    height: Dimensions.get("window").width / 3 - 8,
    margin: 4,
    borderRadius: 8,
  },
  modalImage: {
    width: "100%",
    height: 300,
    marginBottom: 10,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  commentInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  footerMenu: {
    position: "absolute",
    bottom: 24,
    right: 24,
    alignItems: "flex-end",
  },
  actionMenu: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    color: "#b603fc",
    paddingVertical: 4,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#b603fc",
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

const ProfileScreen = ({ route: { params } = {} }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    let uid;
    const userId = params?.userId || null;
    if (userId) {
      uid = userId;
    } else {
      uid = auth.currentUser?.uid;
    }

    const token = await auth.currentUser?.getIdToken();
    if (!uid || !token) return;
    const data = await getProfile(token, uid);
    const postsData = await getPosts(token, uid);
    setUserInfo(data);
    setPosts(postsData);
  };

  useEffect(() => {
    fetchUserData().finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Erro", "Erro ao realizar logout.");
    }
  };

  const refreshPost = async (postId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const updated = await getPost(token, postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setSelectedPost(updated);
      const newUserData = await getProfile(token, userInfo.user_id);
      setUserInfo(newUserData);
    } catch {
      Alert.alert("Erro", "Erro ao atualizar post.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await likePost(token, postId);
      await refreshPost(postId);
    } catch {
      Alert.alert("Erro", "Erro ao curtir o post");
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await deletePost(token, selectedPost.id);
      setModalVisible(false);
      await fetchUserData();
    } catch {
      Alert.alert("Erro", "Erro ao excluir o post");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await commentPost(token, selectedPost.id, commentText);
      setCommentText("");
      await refreshPost(selectedPost.id);
    } catch {
      Alert.alert("Erro", "Erro ao comentar o post");
    }
  };

  const renderGalleryItem = ({ item }) =>
    item.pics.map((pic, index) => (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        onPress={() => {
          setSelectedPost(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: pic }} style={styles.image} />
      </TouchableOpacity>
    ));

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
      <Text style={styles.username}>{formatPhone(userInfo.phone_number)}</Text>

      {posts.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
          Nenhum post encontrado.
        </Text>
      ) : null}

      <View style={styles.gallery}>
        <FlatList
          data={posts}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
        />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          if (selectedPost) refreshPost(selectedPost.id);
        }}
      >
        <View style={styles.modalContainer}>
          {selectedPost?.pics.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.modalImage} />
          ))}
          <Text>{selectedPost?.description}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <EvilIcons
              name="location"
              size={20}
              color="#555"
              style={{ marginRight: 4 }}
            />
            <Text style={{ color: "#555", fontSize: 14 }}>
              {selectedPost?.localization
                ? getReadableLocation(
                    selectedPost?.localization.lat,
                    selectedPost?.localization.lng,
                  )
                : "Localização não disponível"}
            </Text>
          </View>
          <Text style={{ marginTop: 10, color: "#666" }}>
            {selectedPost?.likes_count} curtidas ·{" "}
            {selectedPost?.comments_count} comentários
          </Text>
          {selectedPost?.comments?.map((c) => (
            <View
              key={c.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <UserAvatar
                photoUrl={c.user?.profile_picture}
                size={30}
                redirect={true}
              />
              <Text style={{ marginLeft: 8 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {c.user?.username || c.user_id}:
                </Text>{" "}
                {c.content}
              </Text>
            </View>
          ))}
          <TextInput
            placeholder="Adicione um comentário..."
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
          />
          <PrimaryButton text="Comentar" action={handleComment} />

          {/* Botão excluir post, só aparece se for dono do post */}
          {auth.currentUser?.uid === selectedPost?.user_id && (
            <PrimaryButton text="Excluir post" action={handleDelete} />
          )}

          {/* Botão curtir só aparece se NÃO for dono do post */}
          {auth.currentUser?.uid !== selectedPost?.user_id &&
            (userInfo.liked_posts?.includes(selectedPost?.id) ? (
              <DangerButton
                text="Descurtir"
                action={() => handleLike(selectedPost.id)}
              />
            ) : (
              <PrimaryButton
                text="Curtir"
                action={() => handleLike(selectedPost.id)}
              />
            ))}

          <DangerButton
            text="Fechar"
            action={() => {
              setModalVisible(false);
              if (selectedPost) refreshPost(selectedPost.id);
            }}
          />
        </View>
      </Modal>

      <View style={styles.footerMenu}>
        {isMenuOpen && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditUserInfo")}
            >
              <Text style={styles.actionText}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Text style={styles.actionText}>Voltar para posts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.actionText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => setIsMenuOpen((prev) => !prev)}
        >
          <Text style={styles.hamburgerText}>≡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
