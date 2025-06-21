import api from "./api";

export const getPosts = async (token, lastId = null) => {
  try {
    const response = await api.get("/posts/", {
      headers: { Authorization: `Bearer ${token}` },
      params: lastId ? { last_doc_id: lastId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
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
