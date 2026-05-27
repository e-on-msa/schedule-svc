// schedule-svc/src/services/mySchoolService.js
const redis = require("../config/redis");
const { fetchMySchoolFromUserSvc } = require("./userSvcClient");

const ttlFromEnv = Number(process.env.MY_SCHOOL_CACHE_TTL_SECONDS);
const MY_SCHOOL_TTL_SECONDS =
    Number.isInteger(ttlFromEnv) && ttlFromEnv > 0 ? ttlFromEnv : 86400;

function getMySchoolCacheKey(userId) {
    return `user:${userId}:my_school`;
}

function normalizeMySchoolPayload(payload) {
    if (!payload) return null;

    const schoolCode = payload.school_code ?? payload.schoolCode;
    const regionId = payload.region_id ?? payload.regionId;

    const normalizedSchoolCode = String(schoolCode ?? "").trim();
    const normalizedRegionId = Number(regionId);

    if (!normalizedSchoolCode) return null;
    if (!Number.isInteger(normalizedRegionId)) return null;

    return {
        school_code: normalizedSchoolCode,
        region_id: normalizedRegionId,
    };
}

async function getMySchoolByUserId(userId) {
    const cacheKey = getMySchoolCacheKey(userId);

    let cached = null;

    try {
        cached = await redis.get(cacheKey);
    } catch (_) {
        cached = null;
    }

    if (cached) {
        try {
            const school = normalizeMySchoolPayload(JSON.parse(cached));

            if (school) {
                return {
                    source: "cache",
                    school,
                };
            }

            await redis.del(cacheKey).catch(() => {});
        } catch (_) {
            await redis.del(cacheKey).catch(() => {});
        }
    }

    const school = normalizeMySchoolPayload(
        await fetchMySchoolFromUserSvc(userId),
    );

    if (!school) {
        const error = new Error("사용자의 학교 정보가 없습니다.");
        error.status = 404;
        throw error;
    }

    await redis
        .set(cacheKey, JSON.stringify(school), "EX", MY_SCHOOL_TTL_SECONDS)
        .catch(() => {});

    return {
        source: "user-svc",
        school,
    };
}

module.exports = {
    getMySchoolByUserId,
};
