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

        const name =
            typeof req.query.name === "string" ? req.query.name.trim() : "";

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

async function getRegionById(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "유효하지 않은 지역 ID입니다.",
            });
        }

        const region = await regionSyncService.getRegionById(id);

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "지역을 찾을 수 없습니다.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                region_id: region.id,
                region_name: region.region_name,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllRegions,
    searchRegionsByName,
    getRegionById,
    syncRegions,
};
