// schedule-svc/src/services/userSvcClient.js
const axios = require("axios");

async function fetchMySchoolFromUserSvc(userId) {
    const baseUrl = process.env.USER_SVC_BASE_URL;
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (!baseUrl) {
        throw new Error("USER_SVC_BASE_URL 환경변수가 설정되지 않았습니다.");
    }
    if (!internalSecret) {
        throw new Error("INTERNAL_API_SECRET 환경변수가 설정되지 않았습니다.");
    }

    const { data } = await axios.get(
        `${baseUrl}/internal/users/${encodeURIComponent(userId)}/my-school`,
        {
            headers: {
                "x-internal-secret": internalSecret,
            },
            timeout: 5000,
        },
    );

    return data?.data ?? data;
}

module.exports = {
    fetchMySchoolFromUserSvc,
};
