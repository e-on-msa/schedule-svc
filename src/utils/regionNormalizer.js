// schedule-svc/src/utils/regionNormalizer.js

const norm10 = (value) => String(value).trim().padStart(10, "0");
const norm3 = (value) => String(value).trim().padStart(3, "0");

const NO_GU_CITIES = new Set(["경기도 부천시", "세종특별자치시"]);

function baseCityNameFromGu(fullName = "") {
    const parts = String(fullName).trim().split(/\s+/);

    if (parts.length >= 2 && parts[parts.length - 1].endsWith("구")) {
        parts.pop();
        return parts.join(" ");
    }

    return null;
}

function extractSigungu(rawRegions) {
    const rows = rawRegions.map((region) => ({
        ...region,
        region_cd: norm10(region.region_cd),
        locathigh_cd: norm10(region.locathigh_cd),
        sgg_cd: norm3(region.sgg_cd),
        umd_cd: norm3(region.umd_cd),
        locatadd_nm: String(region.locatadd_nm || "").trim(),
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

        if (base && NO_GU_CITIES.has(base)) {
            return;
        }

        cityWithGuByCode.add(region.locathigh_cd);

        if (base) {
            cityWithGuByName.add(base);
        }
    });

    const sigunguRegions = rows.filter((region) => {
        const isSigunguLevel =
            region.sgg_cd !== "000" && region.umd_cd === "000";

        if (!isSigunguLevel) {
            return false;
        }

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
};
