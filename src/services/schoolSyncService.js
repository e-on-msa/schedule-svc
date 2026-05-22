// schedule-svc/src/services/schoolSyncService.js
const { Op } = require("sequelize");
const { School } = require("../../models");
const { ATPT_CODES } = require("../constants/atptCodes");
const { fetchSchoolsFromNeisByAtptCode } = require("./schoolClient");
const {
    isExcludedSchoolType,
    normalizeSchool,
    toSchoolResponse,
} = require("../utils/schoolNormalizer");

async function searchSchools(query) {
    const where = {};

    if (query && query.trim() !== "") {
        where.school_name = {
            [Op.like]: `%${query.trim()}%`,
        };
    }

    const rows = await School.findAll({
        where,
        order: [["school_name", "ASC"]],
        limit: 1000,
    });

    return rows.map(toSchoolResponse);
}

async function searchSchoolBySchoolCode(query) {
    const rows = await School.findAll({
        where: {
            school_code: query,
        },
        order: [["school_name", "ASC"]],
    });

    return rows.map(toSchoolResponse);
}

async function syncSchoolsFromNeis() {
    const normalizedSchools = [];
    const failedAtptCodes = [];

    for (const atptCode of ATPT_CODES) {
        try {
            const rawSchools = await fetchSchoolsFromNeisByAtptCode(atptCode);

            const schools = rawSchools
                .filter((rawSchool) => {
                    const schoolType = rawSchool.SCHUL_KND_SC_NM || "";

                    return (
                        rawSchool.SD_SCHUL_CODE &&
                        rawSchool.ATPT_OFCDC_SC_CODE &&
                        rawSchool.SCHUL_NM &&
                        !isExcludedSchoolType(schoolType)
                    );
                })
                .map(normalizeSchool);

            normalizedSchools.push(...schools);
        } catch (error) {
            failedAtptCodes.push({
                atptCode,
                reason: error.message,
            });
        }
    }

    if (normalizedSchools.length > 0) {
        await School.bulkCreate(normalizedSchools, {
            updateOnDuplicate: [
                "atpt_code",
                "region_id",
                "school_name",
                "address",
                "school_type",
                "updated_at",
            ],
        });
    }

    return {
        syncedCount: normalizedSchools.length,
        failedCount: failedAtptCodes.length,
        failedAtptCodes,
    };
}

module.exports = {
    searchSchools,
    searchSchoolBySchoolCode,
    syncSchoolsFromNeis,
};
