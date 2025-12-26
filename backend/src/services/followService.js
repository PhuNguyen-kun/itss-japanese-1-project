const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");

class FollowService {
  async follow(followerId, followingId) {
    // Check if user is trying to follow themselves
    if (followerId === followingId) {
      throw new BadRequestError("自分自身をフォローすることはできません");
    }

    // Check if following user exists
    const followingUser = await db.User.findByPk(followingId);
    if (!followingUser) {
      throw new NotFoundError("ユーザーが見つかりません");
    }

    // Check if already following
    const existingFollow = await db.Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow) {
      throw new BadRequestError("既にフォローしています");
    }

    // Create follow relationship (using findOrCreate to handle race conditions)
    try {
      await db.Follow.create({
        follower_id: followerId,
        following_id: followingId,
      });
    } catch (error) {
      // Handle duplicate entry error (race condition)
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new BadRequestError("既にフォローしています");
      }
      throw error;
    }

    return { message: "フォローしました" };
  }

  async unfollow(followerId, followingId) {
    const follow = await db.Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (!follow) {
      throw new NotFoundError("フォロー関係が見つかりません");
    }

    // Hard delete (since paranoid is disabled)
    await follow.destroy();

    return { message: "フォローを解除しました" };
  }

  async getFollowers(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const offset = (page - 1) * perPage;

    const { count, rows } = await db.Follow.findAndCountAll({
      where: { following_id: userId },
      include: [
        {
          model: db.User,
          as: "follower",
          attributes: [
            "id",
            "username",
            "first_name",
            "last_name",
            "avatar_url",
            "bio",
            "current_job",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
      distinct: true,
    });

    return {
      followers: rows.map((follow) => follow.follower),
      pagination: {
        total: count,
        page,
        per_page: perPage,
        total_pages: Math.ceil(count / perPage),
      },
    };
  }

  async getFollowing(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const offset = (page - 1) * perPage;

    const { count, rows } = await db.Follow.findAndCountAll({
      where: { follower_id: userId },
      include: [
        {
          model: db.User,
          as: "following",
          attributes: [
            "id",
            "username",
            "first_name",
            "last_name",
            "avatar_url",
            "bio",
            "current_job",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
      distinct: true,
    });

    return {
      following: rows.map((follow) => follow.following),
      pagination: {
        total: count,
        page,
        per_page: perPage,
        total_pages: Math.ceil(count / perPage),
      },
    };
  }

  async checkIfFollowing(followerId, followingId) {
    const follow = await db.Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    return { is_following: !!follow };
  }

  async getFollowStats(userId) {
    const followersCount = await db.Follow.count({
      where: { following_id: userId },
    });

    const followingCount = await db.Follow.count({
      where: { follower_id: userId },
    });

    return {
      followers_count: followersCount,
      following_count: followingCount,
    };
  }
}

module.exports = new FollowService();

