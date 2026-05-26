// schedule-svc/src/utils/schoolTypeUtils.js
function normalizeAverageSchoolType(schoolType = "") {
    if (schoolType.includes("초등")) return "elementary";
    if (schoolType.includes("중학")) return "middle";

    return null;
}

module.exports = {
    normalizeAverageSchoolType,
};
