// schedule-svc/src/utils/addressUtils.js
function extractDistrict(address = "") {
    const parts = address.trim().split(/\s+/);

    return (
        parts.findLast(
            (part) =>
                part.endsWith("구") ||
                part.endsWith("군") ||
                part.endsWith("시"),
        ) || null
    );
}

module.exports = {
    extractDistrict,
};
