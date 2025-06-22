import api from "./api";

export const createProfile = async (
  bearerToken,
  phone_number,
  name,
  username,
) => {
  try {
    const response = await api.post(
      "/profile/create",
      {
        phone_number,
        name,
        username,
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    return response.data;
  } catch (error) {}
};

export const getProfile = async (token, userId) => {
  console.log(userId);
  try {
    const response = await api.get(`/profile/data/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateProfile = async (
  token,
  name = null,
  username = null,
  phone = null,
  profilePicture = null,
) => {
  const response = await api.put(
    "/profile/update/",
    {
      name,
      username,
      phone,
      profilePicture,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const uploadProfilePicture = async (token, uri) => {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "profile_picture.jpg",
    type: "image/jpeg",
  });

  try {
    const response = await api.post("/profile/pic/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};
