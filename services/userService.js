import api from "./api";

export const createProfile = async (bearerToken, phone, name, username) => {
  try {
    const response = await api.post(
      "/profile/create",
      {
        phone,
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
  const response = await api.get(`/profile/data/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
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
