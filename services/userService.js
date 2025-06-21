import api from "./api";

export const createOrUpdateUser = async (
  bearerToken,
  phone,
  name,
  username,
) => {
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
