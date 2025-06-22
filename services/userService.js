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

    console.log(response.status);
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
