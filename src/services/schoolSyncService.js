// schedule-svc/src/services/schoolSyncService.js
const { Op } = require("sequelize");
const { School, AcademicSchedule } = require("../../models");
const { ATPT_CODES } = require("../constants/atptCodes");
const { fetchSchoolsFromNeisByAtptCode } = require("./schoolClient");
const {
    toNeisLikeScheduleResponse,
} = require("../utils/academicScheduleResponseMapper");
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
    const rows = await School.findOne({
        where: {
            school_code: query,
        },
    });

    return rows ? toSchoolResponse(rows) : null;
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

function getCurrentAcademicYear() {
    const today = new Date();
    return today.getMonth() + 1 >= 3
        ? String(today.getFullYear())
        : String(today.getFullYear() - 1);
}

function resolveAcademicYear(year) {
    const currentYear = getCurrentAcademicYear();
    if (year == null || year === "") {
        return currentYear;
    }

    if (year === "prev") {
        return String(Number(currentYear) - 1);
    }

    if (/^\d{4}$/.test(String(year))) {
        return String(year);
    }

    const error = new Error("year는 'prev' 또는 4자리 연도여야 합니다.");
    error.status = 400;
    throw error;
}

function getGradeColumn(grade) {
    if (grade == null || grade === "") {
        return null;
    }

    const gradeMap = {
        1: "one_grade_event_yn",
        2: "tw_grade_event_yn",
        3: "three_grade_event_yn",
        4: "fr_grade_event_yn",
        5: "fiv_grade_event_yn",
        6: "six_grade_event_yn",
    };

    const column = gradeMap[String(grade)];
    if (!column) {
        const error = new Error("grade는 1~6 사이 값이어야 합니다.");
        error.status = 400;
        throw error;
    }
    return column;
}

async function getSchoolSchedule(schoolCode, options = {}) {
    const school = await School.findOne({
        where: {
            school_code: schoolCode,
        },
    });

    if (!school) {
        return [];
    }

    return getAllSchoolSchedule(schoolCode, school.atpt_code, options);
}

async function getAllSchoolSchedule(schoolCode, atptCode, options = {}) {
    const academicYear = resolveAcademicYear(options.year);
    const gradeColumn = getGradeColumn(options.grade);

    const where = {
        school_code: schoolCode,
        atpt_code: atptCode,
        academic_year: academicYear,
    };

    if (gradeColumn) {
        where[gradeColumn] = "Y";
    }

    const rows = await AcademicSchedule.findAll({
        where,
        order: [
            ["aa_ymd", "ASC"],
            ["event_name", "ASC"],
        ],
    });

    return rows.map(toNeisLikeScheduleResponse);
}

module.exports = {
    searchSchools,
    searchSchoolBySchoolCode,
    syncSchoolsFromNeis,
    getSchoolSchedule,
    getAllSchoolSchedule,
};
