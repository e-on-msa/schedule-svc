// schedule-svc/src/services/regionSyncService.js
const { Op } = require("sequelize");
const { Region } = require("../../models");
const { fetchAllRegionsFromMolit } = require("./regionClient");
const { extractSigungu } = require("../utils/regionNormalizer");

async function getAllRegions() {
    return Region.findAll({
        order: [["id", "ASC"]],
    });
}

async function searchRegionsByName(regionName) {
    return Region.findAll({
        where: {
            region_name: {
                [Op.like]: `%${regionName}%`,
            },
        },
        order: [["id", "ASC"]],
    });
}

async function getRegionById(id) {
    return Region.findByPk(id);
}

async function syncRegionsFromMolit() {
    const rawRegions = await fetchAllRegionsFromMolit();
    const sigunguRegions = extractSigungu(rawRegions);

    await Region.bulkCreate(sigunguRegions, {
        updateOnDuplicate: ["region_name", "updated_at"],
    });

    return {
        syncedCount: sigunguRegions.length,
    };
}

module.exports = {
    getAllRegions,
    searchRegionsByName,
    getRegionById,
    syncRegionsFromMolit,
};