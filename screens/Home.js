import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { auth } from "../firebase";
import { getProfile } from "../services/userService";
import { getPosts, likePost, commentPost } from "../services/postService";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Logo from "../components/Logo";
import UserAvatar from "../components/userAvatar";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    position: "relative",
    backgroundColor: "#fff",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  postCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 12,
    resizeMode: "cover",
  },
  postDescription: { fontSize: 16, marginBottom: 10 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  likeButton: { color: "#b603fc", fontWeight: "bold" },
  commentButton: { color: "#555" },
  commentModal: { flex: 1, padding: 20, backgroundColor: "#fff" },
  commentInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [lastPostId, setLastPostId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const navigation = useNavigation();

  const loadPosts = async (userInstance, forceReset = false) => {
    if (!userInstance) return;
    try {
      const token = await userInstance.getIdToken();
      const fetchedPosts = await getPosts(
        token,
        forceReset ? null : lastPostId,
      );
      if (fetchedPosts.length > 0) {
        const newLastId = fetchedPosts[fetchedPosts.length - 1].id;
        setLastPostId(newLastId);
        setPosts((prevPosts) => {
          if (forceReset) return fetchedPosts;
          const existingIds = new Set(prevPosts.map((p) => p.id));
          const filteredNewPosts = fetchedPosts.filter(
            (p) => !existingIds.has(p.id),
          );
          return [...prevPosts, ...filteredNewPosts];
        });
      } else if (forceReset) {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        const profile = await getProfile(token, currentUser.uid);
        if (!profile) navigation.navigate("NewUserInfo");
        else setUserProfile(profile);
        await loadPosts(currentUser, true);
      } else {
        setUser(null);
        setUserProfile(null);
        setPosts([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchMorePosts = () => loadPosts(user);

  const handleLike = async (postId) => {
    if (!user) return Alert.alert("Você precisa estar logado para curtir.");
    setIsLiking(true);
    try {
      const token = await user.getIdToken();
      await likePost(token, postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post,
        ),
      );
    } catch (error) {
      Alert.alert("Erro ao curtir o post");
    }
    setIsLiking(false);
  };

  const handleAddComment = async () => {
    if (!user) return Alert.alert("Você precisa estar logado para comentar.");
    if (!commentText.trim())
      return Alert.alert("Digite um comentário antes de enviar.");
    setIsCommenting(true);
    try {
      const token = await user.getIdToken();
      await commentPost(token, selectedPost.id, commentText);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === selectedPost.id) {
            const updatedComments = post.comments ? [...post.comments] : [];
            updatedComments.unshift({
              id: `temp-${Date.now()}`,
              content: commentText,
              created_at: new Date().toISOString(),
              user_id: user.uid,
              post_id: post.id,
              likes_count: 0,
            });
            return {
              ...post,
              comments: updatedComments,
              comments_count: (post.comments_count || 0) + 1,
            };
          }
          return post;
        }),
      );
      setCommentText("");
    } catch (error) {
      Alert.alert("Erro ao enviar comentário");
    }
    setIsCommenting(false);
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard} key={item.id}>
      {item.pics?.length > 0 && (
        <Image source={{ uri: item.pics[0] }} style={styles.postImage} />
      )}
      <Text style={styles.postDescription}>{item.description}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => handleLike(item.id)}
          disabled={isLiking}
        >
          <Text style={styles.likeButton}>
            ❤️ Curtir ({item.likes_count || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedPost(item);
            setCommentModalVisible(true);
          }}
        >
          <Text style={styles.commentButton}>
            💬 Comentários ({item.comments_count || 0})
          </Text>
        </TouchableOpacity>
      </View>
      {item.comments?.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {item.comments.slice(0, 2).map((comment) => (
            <Text key={comment.id} style={{ marginTop: 2 }}>
              <Text style={{ fontWeight: "bold" }}>{comment.user_id}: </Text>
              {comment.content}
            </Text>
          ))}
          {item.comments.length > 2 && (
            <Text style={{ color: "#666", marginTop: 4 }}>
              ...ver mais comentários
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b603fc" />
          <Text>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Logo />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.5}
      />

      {userProfile && (
        <View style={styles.footer}>
          <UserAvatar
            photoUrl={userProfile.profile_picture}
            size={70}
            redirect={true}
          />
        </View>
      )}

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentModal}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Comentários</Text>

          {selectedPost?.comments?.length > 0 ? (
            selectedPost.comments.map((comment) => (
              <Text key={comment.id} style={{ marginVertical: 3 }}>
                <Text style={{ fontWeight: "bold" }}>{comment.user_id}: </Text>
                {comment.content}
              </Text>
            ))
          ) : (
            <Text>Nenhum comentário ainda.</Text>
          )}

          <TextInput
            placeholder="Adicione um comentário..."
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            editable={!isCommenting}
          />
          <TouchableOpacity onPress={handleAddComment} disabled={isCommenting}>
            <Text style={{ color: "#b603fc", fontWeight: "bold" }}>
              {isCommenting ? "Enviando..." : "Enviar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCommentModalVisible(false)}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: "#b603fc" }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
