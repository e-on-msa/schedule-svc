// schedule-svc/src/services/mySchoolService.js
const redis = require("../config/redis");
const { fetchMySchoolFromUserSvc } = require("./userSvcClient");

const MY_SCHOOL_TTL_SECONDS = Number(
    process.env.MY_SCHOOL_CACHE_TTL_SECONDS || 86400,
);

function getMySchoolCacheKey(userId) {
    return `user:${userId}:my_school`;
}

async function getMySchoolByUserId(userId) {
    const cacheKey = getMySchoolCacheKey(userId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return {
            source: "cache",
            school: JSON.parse(cached),
        };
    }

    const school = await fetchMySchoolFromUserSvc(userId);

    if (!school?.schoolCode) {
        const error = new Error("사용자의 학교 정보가 없습니다.");
        error.status = 404;
        throw error;
    }

    await redis.set(
        cacheKey,
        JSON.stringify(school),
        "EX",
        MY_SCHOOL_TTL_SECONDS,
    );

    return {
        source: "user-svc",
        school,
    };
}

module.exports = {
    getMySchoolByUserId,
};
