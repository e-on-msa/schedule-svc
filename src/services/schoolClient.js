// schedule-svc/src/services/schoolClient.js
const axios = require("axios");

const NEIS_SCHOOL_INFO_URL = "https://open.neis.go.kr/hub/schoolInfo";
const NEIS_EMPTY_RESULT_CODE = "INFO-200";
const NEIS_SUCCESS_RESULT_CODE = "INFO-000";

function assertValidNeisSchoolInfoResponse(responseData) {
    const result =
        responseData?.RESULT ||
        responseData?.schoolInfo?.[0]?.head?.[1]?.RESULT;

    if (!result) return;

    const { CODE, MESSAGE } = result;

    if (CODE === NEIS_EMPTY_RESULT_CODE || CODE === NEIS_SUCCESS_RESULT_CODE) {
        return;
    }

    throw new Error(`NEIS schoolInfo API 오류: ${CODE} - ${MESSAGE}`);
}

function extractSchoolInfoRows(responseData) {
    assertValidNeisSchoolInfoResponse(responseData);

    const rows = responseData?.schoolInfo?.[1]?.row;
    if (!Array.isArray(rows)) return [];

    return rows;
}

function extractTotalCount(responseData) {
    const head = responseData?.schoolInfo?.[0]?.head;
    const totalItem = Array.isArray(head)
        ? head.find((item) => item.list_total_count !== undefined)
        : null;

    return Number(totalItem?.list_total_count ?? 0);
}

async function fetchSchoolsFromNeisByAtptCode(atptCode) {
    const apiKey = process.env.NEIS_API_KEY;

    if (!apiKey) {
        throw new Error("NEIS_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    if (!atptCode) {
        throw new Error("ATPT_OFCDC_SC_CODE가 필요합니다.");
    }

    const pageSize = 1000;
    let pageIndex = 1;
    const result = [];

    while (true) {
        const { data } = await axios.get(NEIS_SCHOOL_INFO_URL, {
            params: {
                KEY: apiKey,
                Type: "json",
                pIndex: pageIndex,
                pSize: pageSize,
                ATPT_OFCDC_SC_CODE: atptCode,
            },
            timeout: 10000,
        });

        const rows = extractSchoolInfoRows(data);
        const totalCount = extractTotalCount(data);

        result.push(...rows);

        if (rows.length === 0) break;
        if (totalCount > 0 && result.length >= totalCount) break;
        if (rows.length < pageSize) break;

        pageIndex += 1;
    }

    return result;
}

module.exports = {
    fetchSchoolsFromNeisByAtptCode,
};
