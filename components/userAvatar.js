import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "../services/userService";
import { auth } from "../firebase";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&s=200";

const UserAvatar = ({
  photoUrl,
  size = 100,
  onChange,
  redirect = false,
  redirectUid = null,
}) => {
  const [localUri, setLocalUri] = useState(null);
  const navigation = useNavigation();

  const handleUpload = async (uri) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await uploadProfilePicture(token, uri);
      onChange?.(uri);
      Alert.alert("Sucesso", "Foto de perfil atualizada.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a foto de perfil.");
    }
  };

  const handlePress = async () => {
    if (redirect) {
      navigation.navigate("Profile", {
        userId: redirectUid || null,
      });
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão negada", "Permita acesso à galeria.");
      return;
    }

    Alert.alert("Escolha uma opção", "", [
      {
        text: "Galeria",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setLocalUri(uri);
            await handleUpload(uri);
          }
        },
      },
      {
        text: "Câmera",
        onPress: async () => {
          const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPerm.granted) {
            Alert.alert("Permissão negada", "Permita acesso à câmera.");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setLocalUri(uri);
            await handleUpload(uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Image
        source={{ uri: localUri || photoUrl || DEFAULT_AVATAR }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#eee",
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default UserAvatar;
