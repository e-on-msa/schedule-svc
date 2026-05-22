// schedule-svc/src/utils/schoolNormalizer.js
function isExcludedSchoolType(schoolType = "") {
    return (
        schoolType.includes("고등") ||
        schoolType.includes("각종학교(고)") ||
        schoolType.includes("평생학교(고)-3년6학기") ||
        schoolType.includes("평생학교(고)-2년6학기")
    );
}

function normalizeSchool(rawSchool) {
    const schoolType = rawSchool.SCHUL_KND_SC_NM || "";

    return {
        school_code: rawSchool.SD_SCHUL_CODE,
        atpt_code: rawSchool.ATPT_OFCDC_SC_CODE,
        school_name: rawSchool.SCHUL_NM,
        address: rawSchool.ORG_RDNMA || rawSchool.ORG_RDNDA || null,
        school_type: schoolType || "UNKNOWN",
        region_id: null,
    };
}

function toSchoolResponse(row) {
    return {
        schoolCode: row.school_code,
        name: row.school_name,
        address: row.address,
        schoolType: row.school_type,
        atptCode: row.atpt_code,
    };
}

module.exports = {
    isExcludedSchoolType,
    normalizeSchool,
    toSchoolResponse,
};
