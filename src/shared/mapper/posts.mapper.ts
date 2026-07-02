import { smallAvatar } from "../../libs/avatar.js";
import { PostReturned } from "../types/posts.type.js";

export const generatePostResponse = (post: PostReturned) => {
  return {
    ...post,
    tags: post.tags.map(
      (tag) => tag.tag,
    ),
    author: {
      ...post.author,
      avatar: post.author.avatar ? smallAvatar(post.author.avatar) : null,
    },
  };
};