// schedule-svc/src/utils/addressUtils.js
function extractDistrict(address = "") {
    const parts = address.trim().split(/\s+/);

    const district = parts.find((part) => part.endsWith("구"));
    if (district) return district;

    const county = parts.find((part) => part.endsWith("군"));
    if (county) return county;

    const city = parts.find((part) => part.endsWith("시"));
    return city || null;
}

module.exports = {
    extractDistrict,
};
