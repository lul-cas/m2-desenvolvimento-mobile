import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getProfile } from "../services/userService";
import UserAvatar from "./userAvatar";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";

const PostAuthor = ({ userId }) => {
  const [author, setAuthor] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAuthor = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !userId) return;
      const token = await currentUser.getIdToken();
      const data = await getProfile(token, userId);
      if (data) setAuthor(data);
    };
    fetchAuthor();
  }, [userId]);

  if (!author) return null;

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
    >
      <UserAvatar
        photoUrl={author.profile_picture}
        size={30}
        redirect={true}
        redirectUid={author.user_id}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Profile", { userId: author.user_id })
        }
      >
        <Text style={{ fontWeight: "bold", marginLeft: 8 }}>
          {author.username} ({author.name})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostAuthor;
