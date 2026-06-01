// schedule-svc/src/utils/addressUtils.js
function extractDistrict(address) {
    if (typeof address !== "string") {
        return null;
    }

    const normalizedAddress = address.trim();

    if (!normalizedAddress) {
        return null;
    }

    const parts = normalizedAddress.split(/\s+/);

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
