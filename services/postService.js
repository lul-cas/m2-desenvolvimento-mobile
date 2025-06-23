import api from "./api";

export const registerPost = async (
  token,
  { description, localization, likes_count = 0 },
) => {
  const response = await api.post(
    "/posts/",
    { description, localization, likes_count },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

export const uploadPostPicture = async (token, postId, imageUri, imageType) => {
  if (!imageUri || typeof imageUri !== "string") {
    console.error("Invalid imageUri provided:", imageUri);
    throw new Error("Invalid image URI.");
  }

  const formData = new FormData();

  const filename = imageUri.split("/").pop();

  const uriToUse = imageUri.startsWith("file://")
    ? imageUri
    : `file://${imageUri}`;

  formData.append("file", {
    uri: uriToUse,
    name: filename,
    type: imageType || "application/octet-stream",
  });

  const response = await api.post(`/posts/${postId}/pic`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadMultiplePictures = async (token, postId, imageUris = []) => {
  const results = [];
  for (const uri of imageUris) {
    try {
      const result = await uploadPostPicture(token, postId, uri, "image/jpeg");
      results.push(result);
    } catch (error) {
      console.error(`Error uploading picture ${uri}:`, error);
    }
  }
  return results;
};

export const getPosts = async (token, userId = null) => {
  let params = {};
  if (userId) {
    params.user_id = userId;
  }

  const response = await api.get("/posts/", {
    headers: { Authorization: `Bearer ${token}` },
    params: params,
  });

  response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return response.data;
};

export const getPost = async (token, postId) => {
  const response = await api.get(`/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const likePost = async (token, postId) => {
  try {
    await api.post(`/posts/${postId}/like`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

export const dislikePost = async (token, postId) => {
  try {
    await api.post(`/posts/${postId}/dislike`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error disliking post:", error);
    throw error;
  }
};

export const commentPost = async (token, postId, content) => {
  try {
    await api.post(
      `/posts/${postId}/comment`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (error) {
    console.error("Error commenting on post:", error);
    throw error;
  }
};

export const likeComment = async (token, postId, commentId) => {
  try {
    await api.post(`/posts/${postId}/comment/${commentId}/like`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    throw error;
  }
};

export const dislikeComment = async (token, postId, commentId) => {
  try {
    await api.post(`/posts/${postId}/comment/${commentId}/dislike`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    throw error;
  }
};

export const deletePost = async (token, postId) => {
  try {
    await api.delete(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
