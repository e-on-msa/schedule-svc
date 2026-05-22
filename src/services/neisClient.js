// schedule-svc/src/services/neisClient.js
const axios = require("axios");

const NEIS_SCHOOL_SCHEDULE_URL = "https://open.neis.go.kr/hub/SchoolSchedule";
const NEIS_EMPTY_RESULT_CODE = "INFO-200";
const NEIS_SUCCESS_RESULT_CODE = "INFO-000";

function getNeisResult(responseData) {
    return (
        responseData?.RESULT ||
        responseData?.SchoolSchedule?.[0]?.head?.[1]?.RESULT
    );
}

function assertValidNeisResponse(responseData) {
    const result = getNeisResult(responseData);

    if (!result) {
        return;
    }

    const { CODE, MESSAGE } = result;

    if (CODE === NEIS_EMPTY_RESULT_CODE || CODE === NEIS_SUCCESS_RESULT_CODE) {
        return;
    }

    throw new Error(`NEIS API 오류: ${CODE} - ${MESSAGE}`);
}

function extractRows(responseData) {
    assertValidNeisResponse(responseData);

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
    const apiKey = process.env.NEIS_API_KEY;

    if (!apiKey) {
        throw new Error("NEIS API 키가 설정되지 않았습니다.");
    }

    if (!atptCode || !schoolCode || !fromYmd || !toYmd) {
        throw new Error(
            "NEIS 학사일정 조회에 필요한 atptCode, schoolCode, fromYmd, toYmd가 필요합니다.",
        );
    }

    const { data } = await axios.get(NEIS_SCHOOL_SCHEDULE_URL, {
        params: {
            KEY: apiKey,
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

async function fetchAcademicSchedulesFromNeis({ atptCode, schoolCode, year }) {
    const apiKey = process.env.NEIS_API_KEY;

    if (!apiKey) {
        throw new Error("NEIS_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const pageSize = 1000;
    let pageIndex = 1;
    const result = [];

    while (true) {
        const { data } = await axios.get(
            "https://open.neis.go.kr/hub/SchoolSchedule",
            {
                params: {
                    KEY: apiKey,
                    Type: "json",
                    pIndex: pageIndex,
                    pSize: pageSize,
                    ATPT_OFCDC_SC_CODE: atptCode,
                    SD_SCHUL_CODE: schoolCode,
                    AA_FROM_YMD: `${year}0101`,
                    AA_TO_YMD: `${year}1231`,
                },
                timeout: 10000,
            },
        );

        const neisResult =
            data?.RESULT || data?.SchoolSchedule?.[0]?.head?.[1]?.RESULT;

        if (neisResult?.CODE && neisResult.CODE !== "INFO-000") {
            if (neisResult.CODE === "INFO-200") return [];
            throw new Error(
                `NEIS SchoolSchedule API 오류: ${neisResult.CODE} - ${neisResult.MESSAGE}`,
            );
        }

        const rows = data?.SchoolSchedule?.[1]?.row;
        if (!Array.isArray(rows)) return result;

        result.push(...rows);

        if (rows.length < pageSize) break;
        pageIndex += 1;
    }

    return result;
}

module.exports = {
    fetchSchoolSchedulesFromNeis,
    fetchAcademicSchedulesFromNeis,
};
