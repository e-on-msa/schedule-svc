// schedule-svc/src/services/neisClient.js
const axios = require("axios");

const NEIS_SCHOOL_SCHEDULE_URL = "https://open.neis.go.kr/hub/SchoolSchedule";

function extractRows(responseData) {
    const rows = responseData?.SchoolSchedule?.[1]?.row;

    if (!Array.isArray(rows)) {
        return [];
    }

    return rows;
}

async function fetchSchoolSchedulesFromNeis({
    atptCode,
    schoolCode,
    fromYmd,
    toYmd,
}) {
    if (!atptCode || !schoolCode || !fromYmd || !toYmd) {
        throw new Error(
            "NEIS 학사일정 조회에 필요한 atptCode, schoolCode, fromYmd, toYmd가 필요합니다.",
        );
    }

    const { data } = await axios.get(NEIS_SCHOOL_SCHEDULE_URL, {
        params: {
            KEY: process.env.NEIS_API_KEY,
            Type: "json",
            ATPT_OFCDC_SC_CODE: atptCode,
            SD_SCHUL_CODE: schoolCode,
            AA_FROM_YMD: fromYmd,
            AA_TO_YMD: toYmd,
        },
        timeout: 10000,
    });

    return extractRows(data);
}

module.exports = {
    fetchSchoolSchedulesFromNeis,
};