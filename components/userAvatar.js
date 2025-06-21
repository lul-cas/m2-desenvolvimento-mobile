import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&s=200";

const UserAvatar = ({ photoUrl, size = 100, onChange, redirect = false }) => {
  const [localUri, setLocalUri] = useState(null);
  const navigation = useNavigation();

  const handlePress = async () => {
    if (redirect) {
      navigation.navigate("Profile");
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
            onChange?.(uri);
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
