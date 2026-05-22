// schedule-svc/src/services/regionClient.js
const axios = require("axios");

const MOLIT_REGION_API_URL =
    "https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList";

async function fetchAllRegionsFromMolit() {
    const apiKey = process.env.MOLIT_API_KEY;

    if (!apiKey) {
        throw new Error("MOLIT_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const allRegions = [];
    let pageNo = 1;
    const numOfRows = 1000;
    let totalCount = 0;

    while (true) {
        const { data } = await axios.get(MOLIT_REGION_API_URL, {
            params: {
                ServiceKey: apiKey,
                pageNo,
                numOfRows,
                type: "json",
            },
            timeout: 15000,
        });

        const pack = data?.StanReginCd;

        const rows = pack?.[1]?.row;
        if (!Array.isArray(pack) || !Array.isArray(rows)) {
            throw new Error("행정표준코드 API 응답 형식이 예상과 다릅니다.");
        }

        const head = pack[0]?.head?.[0];
        totalCount = Number.parseInt(head?.totalCount ?? "", 10);
        if (!Number.isFinite(totalCount) || totalCount < 0) {
            throw new Error(
                "행정표준코드 API totalCount 값이 유효하지 않습니다.",
            );
        }

        allRegions.push(...rows);

        if (allRegions.length >= totalCount) {
            break;
        }

        pageNo += 1;
    }

    allRegions.sort((a, b) => Number(a.region_cd) - Number(b.region_cd));

    return allRegions;
}

module.exports = {
    fetchAllRegionsFromMolit,
};
