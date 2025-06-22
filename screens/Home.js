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
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { auth } from "../firebase";
import { getProfile } from "../services/userService";
import {
  getPosts,
  getPost,
  likePost,
  dislikePost,
  commentPost,
  registerPost,
  uploadPostPicture,
} from "../services/postService";
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
    left: 20,
  },
  footerCenter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  createPostModal: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  createPostImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    resizeMode: "cover",
  },
  createPostImagesContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  createPostButton: {
    marginTop: 20,
    backgroundColor: "#b603fc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  createPostButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#b603fc",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 16,
  },
  newPostImageContainer: {
    position: "relative",
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

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostImages, setNewPostImages] = useState([]);
  const [newPostLocation, setNewPostLocation] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

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
        console.log("Usuário autenticado:", currentUser.uid);
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
    if (!user)
      return Alert.alert("Você precisa estar logado para curtir ou descurtir.");
    setIsLiking(true);

    try {
      const token = await user.getIdToken();
      const alreadyLiked = userProfile?.liked_posts?.includes(postId);

      setUserProfile((prev) => ({
        ...prev,
        liked_posts: alreadyLiked
          ? prev.liked_posts.filter((id) => id !== postId)
          : [...prev.liked_posts, postId],
      }));

      if (alreadyLiked) {
        await dislikePost(token, postId);
      } else {
        await likePost(token, postId);
      }

      const updated = await getPost(token, postId);

      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setSelectedPost((prev) => (prev?.id === postId ? updated : prev));
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
      Alert.alert("Erro ao realizar ação.");
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
      const updated = await getPost(token, selectedPost.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? updated : p)),
      );
      setSelectedPost(updated);
      setCommentText("");
    } catch {
      Alert.alert("Erro ao enviar comentário");
    }
    setIsCommenting(false);
  };

  const pickImage = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para acessar suas fotos.",
      );
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (
      !pickerResult.canceled &&
      pickerResult.assets &&
      pickerResult.assets.length > 0
    ) {
      const imageUri = pickerResult.assets[0].uri;
      const imageType = pickerResult.assets[0].mimeType;
      setNewPostImages((prev) => [...prev, { uri: imageUri, type: imageType }]);
    } else {
      if (pickerResult.canceled) {
      } else {
        Alert.alert(
          "Seleção de imagem",
          "Não foi possível selecionar a imagem ou nenhum URI encontrado.",
        );
      }
    }
  };

  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para usar a câmera.",
      );
      return;
    }
    let cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (
      !cameraResult.canceled &&
      cameraResult.assets &&
      cameraResult.assets.length > 0
    ) {
      const imageUri = cameraResult.assets[0].uri;
      const imageType = cameraResult.assets[0].mimeType;
      setNewPostImages((prev) => [...prev, { uri: imageUri, type: imageType }]);
    } else {
      if (cameraResult.canceled) {
      } else {
        Alert.alert(
          "Captura de imagem",
          "Não foi possível capturar a imagem ou nenhum URI encontrado.",
        );
      }
    }
  };

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para acessar localização.",
      );
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setNewPostLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  };

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert("Você precisa estar logado para criar um post.");
      return;
    }
    if (!newPostDescription.trim() && newPostImages.length === 0) {
      Alert.alert(
        "Postagem vazia",
        "A descrição ou uma imagem é necessária para criar uma postagem.",
      );
      return;
    }
    setIsPosting(true);
    try {
      const token = await user.getIdToken();

      const postData = {
        description: newPostDescription,
        localization: newPostLocation,
        likes_count: 0,
      };
      const postCreated = await registerPost(token, postData);

      if (newPostImages.length > 0) {
        for (const imageObject of newPostImages) {
          console.log(
            "Tentando upload para Post ID:",
            postCreated.id,
            "URI:",
            imageObject.uri,
            "Type:",
            imageObject.type,
          );
          await uploadPostPicture(
            token,
            postCreated.post_id,
            imageObject.uri,
            imageObject.type,
          );
        }
      }

      await loadPosts(user, true);

      setNewPostDescription("");
      setNewPostImages([]);
      setNewPostLocation(null);
      setCreateModalVisible(false);
      Alert.alert("Post criado com sucesso!");
    } catch (error) {
      if (error.response) {
        console.error(
          "Erro da API ao criar post:",
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        console.error("Erro de rede ao criar post:", error.request);
      } else {
        console.error("Erro ao criar post:", error.message);
      }
      Alert.alert("Erro ao criar post. Por favor, tente novamente.");
    }
    setIsPosting(false);
  };

  const removeImage = (uriToRemove) => {
    setNewPostImages((prev) => prev.filter((img) => img.uri !== uriToRemove));
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard} key={item.id.toString()}>
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
            {userProfile?.liked_posts?.includes(item.id)
              ? "💜 Descurtir"
              : "❤️ Curtir"}{" "}
            ({item.likes_count || 0})
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
          {item.comments.slice(0, 2).map((comment, index) => (
            <View
              key={
                comment.id
                  ? comment.id.toString()
                  : `comment-${index}-${item.id}`
              }
              style={styles.commentItem}
            >
              <UserAvatar photoUrl={comment.user?.profile_picture} size={30} />
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", {
                    username: comment.user?.username,
                  })
                }
              >
                <Text style={{ fontWeight: "bold", marginLeft: 8 }}>
                  {comment.user?.username || comment.user_id}
                </Text>
              </TouchableOpacity>
              <Text>: {comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
        <Logo />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 100 }}
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

      <View style={styles.footerCenter}>
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          style={styles.createPostButton}
          disabled={isPosting}
        >
          <Text style={styles.createPostButtonText}>
            {isPosting ? "Postando..." : "Novo Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentModal}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Comentários</Text>

          {selectedPost?.comments?.length > 0 ? (
            selectedPost.comments.map((comment, index) => (
              <View
                key={
                  comment.id
                    ? comment.id.toString()
                    : `comment-modal-${index}-${selectedPost.id}`
                }
                style={styles.commentItem}
              >
                <UserAvatar
                  photoUrl={comment.user?.profile_picture}
                  size={30}
                />
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Profile", {
                      username: comment.user?.username,
                    })
                  }
                >
                  <Text style={{ fontWeight: "bold", marginLeft: 8 }}>
                    {comment.user?.username || comment.user_id}
                  </Text>
                </TouchableOpacity>
                <Text>: {comment.content}</Text>
              </View>
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

      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.createPostModal}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Criar Novo Post
          </Text>

          {newPostImages.length > 0 ? (
            <View style={styles.createPostImagesContainer}>
              {newPostImages.map((imageObject, index) => (
                <View
                  key={`new-post-image-${index}-${imageObject.uri}`}
                  style={styles.newPostImageContainer}
                >
                  <Image
                    source={{ uri: imageObject.uri }}
                    style={styles.createPostImagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(imageObject.uri)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity onPress={pickImage} style={{ marginBottom: 5 }}>
                <Text style={{ color: "#b603fc" }}>
                  Selecionar Foto da Galeria
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto}>
                <Text style={{ color: "#b603fc" }}>
                  Tirar Foto com a Câmera
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={fetchLocation}
            style={{ marginBottom: 10 }}
          >
            <Text style={{ color: "#b603fc" }}>
              {newPostLocation ? "Localização obtida ✔️" : "Buscar Localização"}
            </Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Descrição"
            style={{
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 5,
              padding: 10,
              marginBottom: 20,
              height: 80,
              textAlignVertical: "top",
            }}
            multiline
            value={newPostDescription}
            onChangeText={setNewPostDescription}
          />

          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={isPosting}
            style={styles.createPostButton}
          >
            <Text style={styles.createPostButtonText}>
              {isPosting ? "Postando..." : "Postar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCreateModalVisible(false)}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: "#b603fc" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
