// schedule-svc/src/services/userSvcClient.js
const axios = require("axios");

async function fetchMySchoolFromUserSvc(userId) {
    const baseUrl = process.env.USER_SVC_BASE_URL;

    if (!baseUrl) {
        throw new Error("USER_SVC_BASE_URL 환경변수가 설정되지 않았습니다.");
    }

    const { data } = await axios.get(
        `${baseUrl}/internal/users/${userId}/my-school`,
        {
            headers: {
                "x-internal-secret": process.env.INTERNAL_API_SECRET,
            },
            timeout: 5000,
        },
    );

    return data?.data ?? data;
}

module.exports = {
    fetchMySchoolFromUserSvc,
};
