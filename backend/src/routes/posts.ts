import { Router } from "express";
import { prisma } from "../utils/prisma";
import authenticateUser from "../middleware/auth.middleware";

export const postRouter = Router();

postRouter.post("/create", authenticateUser,async (req: any, res: any) => {
  try {
    const { title } = req.body;

    if (!title ) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request: Title is required",
      });
    }
    const userId = req.user.id;
    console.log("User ID", userId);

    const post = await prisma.post.create({
      data: {
        title,
        authorId: userId,
        location:{
          lang:req.body.location.lang,
          lat:req.body.location.lat
        }
      },
    });

    return res.status(201).json({
      statusCode: 201,
      message: "Post Created Successfully",
      post,
    });

  } catch (error:any) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
postRouter.get("/", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const posts = await prisma.post.findMany({
      include: {
        likes: { select: { userId: true } }, // Fetch likes (user IDs of those who liked)
        comments: {
          select: {
            id: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Mark posts that the user has liked
    const updatedPosts = posts.map((post: { likes: any[]; })=> ({
      ...post,
      likedByUser: post.likes.some(like => like.userId === userId), // Check if the user has liked the post
    }));

    res.status(200).json({
      statusCode: 200,
      message: "Posts fetched successfully",
      data: updatedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}
type  PostLocation = {
  lat: number;
  lang: number;
};
postRouter.get("/getall", authenticateUser, async (req: any, res: any) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        statusCode: 400,
        message: "Latitude and longitude are required.",
      });
    }

    const posts = await prisma.post.findMany({
      include: {  
        author: { select: { id: true, name: true, email: true } },
        likes: { select: { user: true } },
        comments: { select: { id: true, createdAt: true, user: { select: { id: true, name: true, email: true } } } },
      },
    });

    const filteredPosts = posts.filter((post: { location: any; }) => {
      const { lat, lang } = post?.location as PostLocation; 
      console.log(lat, lang);
      return getDistance(latitude, longitude, lat, lang) <= 10;
    });

    res.status(200).json({
      statusCode: 200,
      message: "Posts fetched successfully",
      data: filteredPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});




postRouter.delete(
  "/delete/:id",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad Request: Post ID is required",
        });
      }

      const userId = req.user?.id; // Extract userId from authenticated request
      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized: Invalid user",
        });
      }

      // Fetch the post to verify ownership
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          message: "Post not found",
        });
      }

      // Check if the user is the owner of the post
      if (post.authorId !== userId) {
        return res.status(403).json({
          statusCode: 403,
          message: "Forbidden: You can only delete your own posts",
        });
      }

      // Delete the post
      await prisma.post.delete({
        where: { id },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Post deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);


// Like a Post
postRouter.post(
  "/:postId/like",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      // Check if the post exists
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the user has already liked the post
      const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existingLike) {
        return res.status(400).json({ message: "You have already liked this post" });
      }

      // Create the like
      await prisma.like.create({ data: { userId, postId } });

      return res.status(201).json({ message: "Post liked successfully" });
    } catch (error: any) {
      console.error("Error liking post:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// Unlike a Post
postRouter.delete(
  "/:postId/unlike",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      // Check if the like exists
      const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (!existingLike) {
        return res.status(400).json({ message: "You have not liked this post" });
      }

      // Delete the like
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });

      return res.status(200).json({ message: "Post unliked successfully" });
    } catch (error: any) {
      console.error("Error unliking post:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// Comment on a Post
// postRouter.post(
//   "/:postId/comment",
//   authenticateUser,
//   async (req: any, res: any) => {
//     try {
//       const { postId } = req.params;
//       const userId = req.user?.id;

//       // Check if post exists
//       const post = await prisma.post.findUnique({ where: { id: postId } });
//       if (!post) {
//         return res.status(404).json({ message: "Post not found" });
//       }

//       // Create the comment
//       const comment = await prisma.comment.create({
//         data: { userId, postId },
//       });

//       return res.status(201).json({ message: "Comment added successfully", comment });
//     } catch (error: any) {
//       console.error("Error adding comment:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
//   }
// );

// Fetch Comments for a Post
postRouter.get("/:postId/comments", async (req: any, res: any) => {
  try {
    const { postId } = req.params;

    // Fetch comments with user info
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" }, // Sort comments by newest first
    });

    return res.status(200).json({ message: "Comments fetched successfully", comments });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete a Comment (Only Owner Can Delete)
postRouter.delete(
  "/comment/:commentId",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      // Find the comment
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true }, // Only fetch userId to reduce DB load
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is the owner
      if (comment.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You cannot delete this comment" });
      }

      // Delete the comment
      await prisma.comment.delete({ where: { id: commentId } });

      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
);
