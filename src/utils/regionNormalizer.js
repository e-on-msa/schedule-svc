// schedule-svc/src/utils/regionNormalizer.js
const norm10 = (value) => String(value).trim().padStart(10, "0");
const norm3 = (value) => String(value).trim().padStart(3, "0");

const NO_GU_CITIES = new Set(["경기도 부천시", "세종특별자치시"]);

const REGION_ALIASES = [
    ["강원도", "강원특별자치도"],
    ["전라북도", "전북특별자치도"],
];

function normalizeRegionName(value = "") {
    let result = String(value || "").trim();

    for (const [from, to] of REGION_ALIASES) {
        result = result.replace(new RegExp(from, "g"), to);
    }

    return result.replace(/\s+/g, " ").trim();
}

function baseCityNameFromGu(fullName = "") {
    const parts = normalizeRegionName(fullName).split(/\s+/);

    if (parts.length >= 2 && parts[parts.length - 1].endsWith("구")) {
        parts.pop();
        return parts.join(" ");
    }

    return null;
}

function extractDistrict(address = "") {
    const normalized = normalizeRegionName(address);

    if (!normalized) return null;

    if (normalized.startsWith("세종특별자치시")) {
        return "세종특별자치시";
    }

    const match = normalized.match(
        /^(?<province>[가-힣]+(?:특별시|광역시|특별자치시|특별자치도|도))\s+(?<city>[가-힣]+(?:시|군|구))(?:\s+(?<gu>[가-힣]+구))?/,
    );

    if (!match) return null;

    const { province, city, gu } = match.groups;

    if (city.endsWith("시") && gu) {
        const full = `${province} ${city} ${gu}`;
        const base = `${province} ${city}`;

        if (NO_GU_CITIES.has(base)) {
            return base;
        }

        return full;
    }

    return `${province} ${city}`;
}

function extractSigungu(rawRegions) {
    const rows = rawRegions.map((region) => ({
        ...region,
        region_cd: norm10(region.region_cd),
        locathigh_cd: norm10(region.locathigh_cd),
        sgg_cd: norm3(region.sgg_cd),
        umd_cd: norm3(region.umd_cd),
        locatadd_nm: normalizeRegionName(region.locatadd_nm),
    }));

    const cityWithGuByCode = new Set();
    const cityWithGuByName = new Set();

    rows.forEach((region) => {
        const name = region.locatadd_nm;
        const isGu =
            region.umd_cd === "000" &&
            region.sgg_cd !== "000" &&
            name.endsWith("구");

        if (!isGu) return;

        const base = baseCityNameFromGu(name);

        if (base && NO_GU_CITIES.has(base)) return;

        cityWithGuByCode.add(region.locathigh_cd);

        if (base) {
            cityWithGuByName.add(base);
        }
    });

    const sigunguRegions = rows.filter((region) => {
        const isSigunguLevel =
            region.sgg_cd !== "000" && region.umd_cd === "000";

        if (!isSigunguLevel) return false;

        const name = region.locatadd_nm;
        const isGu = name.endsWith("구");

        if (isGu) {
            const base = baseCityNameFromGu(name);

            if (base && NO_GU_CITIES.has(base)) {
                return false;
            }
        }

        if (NO_GU_CITIES.has(name)) {
            return true;
        }

        const isCityWithGuByCode = cityWithGuByCode.has(region.region_cd);
        const isCityWithGuByName = cityWithGuByName.has(name);

        return isGu || (!isCityWithGuByCode && !isCityWithGuByName);
    });

    sigunguRegions.sort((a, b) => Number(a.region_cd) - Number(b.region_cd));

    return sigunguRegions.map((region) => ({
        region_code: region.region_cd,
        region_name: region.locatadd_nm,
    }));
}

module.exports = {
    extractSigungu,
    extractDistrict,
    normalizeRegionName,
};
