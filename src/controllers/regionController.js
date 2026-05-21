// schedule-svc/src/controllers/regionController.js
const regionSyncService = require("../services/regionSyncService");

async function getAllRegions(req, res, next) {
    try {
        const regions = await regionSyncService.getAllRegions();

        return res.status(200).json({
            success: true,
            data: regions,
        });
    } catch (error) {
        next(error);
    }
}

async function searchRegionsByName(req, res, next) {
    try {
        console.log("[region search query]", req.query);

        const { name } = req.query;

        const regions = name
            ? await regionSyncService.searchRegionsByName(name)
            : await regionSyncService.getAllRegions();

        return res.status(200).json({
            success: true,
            data: regions,
        });
    } catch (error) {
        next(error);
    }
}

async function syncRegions(req, res, next) {
    try {
        const result = await regionSyncService.syncRegionsFromMolit();

        return res.status(200).json({
            success: true,
            message: "지역 마스터 동기화가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllRegions,
    searchRegionsByName,
    syncRegions,
};