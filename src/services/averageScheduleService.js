// schedule-svc/src/services/averageScheduleService.js
const { Op } = require("sequelize");
const {
    Region,
    School,
    AcademicSchedule,
    AverageAcademicSchedule,
} = require("../../models");
const { extractDistrict } = require("../utils/addressUtils");
const { normalizeAverageSchoolType } = require("../utils/schoolTypeUtils");
const {
    groupEventsByNormalizedName,
} = require("../utils/eventSimilarityUtils");

function getCurrentAcademicYear() {
    const today = new Date();

    return today.getMonth() + 1 >= 3
        ? String(today.getFullYear())
        : String(today.getFullYear() - 1);
}

function resolveAcademicYear(year) {
    const currentYear = getCurrentAcademicYear();

    if (year === "prev") return String(Number(currentYear) - 1);
    if (/^\d{4}$/.test(String(year))) return String(year);

    return currentYear;
}

function getGradeColumn(grade) {
    const gradeMap = {
        1: "one_grade_event_yn",
        2: "tw_grade_event_yn",
        3: "three_grade_event_yn",
        4: "fr_grade_event_yn",
        5: "fiv_grade_event_yn",
        6: "six_grade_event_yn",
    };

    return gradeMap[String(grade)];
}

function toAverageScheduleResponse(row) {
    return {
        id: row.id,
        regionId: row.region_id,
        schoolType: row.school_type,
        academicYear: row.academic_year,
        averageDate: row.average_date,
        eventName: row.event_name,
        oneGradeEventYn: row.one_grade_event_yn,
        twGradeEventYn: row.tw_grade_event_yn,
        threeGradeEventYn: row.three_grade_event_yn,
        frGradeEventYn: row.fr_grade_event_yn,
        fivGradeEventYn: row.fiv_grade_event_yn,
        sixGradeEventYn: row.six_grade_event_yn,
    };
}

function averageDateOnly(events) {
    const timestamps = events
        .map((event) => new Date(event.schedule_date).getTime())
        .filter((time) => !Number.isNaN(time));

    if (timestamps.length === 0) return null;

    const avg = Math.floor(
        timestamps.reduce((sum, time) => sum + time, 0) / timestamps.length,
    );

    return new Date(avg).toISOString().slice(0, 10);
}

function getAnyGradeYn(events, field) {
    return events.some((event) => event[field] === "Y") ? "Y" : "N";
}

async function getSchoolsByRegionName(regionName) {
    const schools = await School.findAll({
        attributes: [
            "school_code",
            "atpt_code",
            "school_name",
            "address",
            "school_type",
        ],
        order: [["school_name", "ASC"]],
    });

    return schools.filter(
        (school) => extractDistrict(school.address) === regionName,
    );
}

async function generateAverageScheduleByRegion({ regionName, year }) {
    const academicYear = resolveAcademicYear(year);

    const region = await Region.findOne({
        where: {
            region_name: regionName,
        },
    });

    if (!region) {
        const error = new Error(
            `등록된 지역을 찾을 수 없습니다: ${regionName}`,
        );
        error.status = 404;
        throw error;
    }

    const schools = await getSchoolsByRegionName(regionName);

    const schoolCodesByType = {
        elementary: [],
        middle: [],
    };

    for (const school of schools) {
        const normalizedType = normalizeAverageSchoolType(school.school_type);

        if (!normalizedType) continue;

        schoolCodesByType[normalizedType].push(school.school_code);
    }

    const rowsToSave = [];

    for (const [schoolType, schoolCodes] of Object.entries(schoolCodesByType)) {
        if (schoolCodes.length === 0) continue;

        const events = await AcademicSchedule.findAll({
            where: {
                school_code: {
                    [Op.in]: schoolCodes,
                },
                academic_year: academicYear,
            },
        });

        const groupedEvents = groupEventsByNormalizedName(events);

        for (const group of groupedEvents) {
            if (group.events.length < 2) continue;

            const averageDate = averageDateOnly(group.events);
            if (!averageDate) continue;

            rowsToSave.push({
                region_id: region.id,
                school_type: schoolType,
                academic_year: academicYear,
                average_date: averageDate,
                event_name: group.title,
                one_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "one_grade_event_yn",
                ),
                tw_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "tw_grade_event_yn",
                ),
                three_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "three_grade_event_yn",
                ),
                fr_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "fr_grade_event_yn",
                ),
                fiv_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "fiv_grade_event_yn",
                ),
                six_grade_event_yn: getAnyGradeYn(
                    group.events,
                    "six_grade_event_yn",
                ),
            });
        }
    }

    if (rowsToSave.length > 0) {
        await AverageAcademicSchedule.bulkCreate(rowsToSave, {
            updateOnDuplicate: [
                "one_grade_event_yn",
                "tw_grade_event_yn",
                "three_grade_event_yn",
                "fr_grade_event_yn",
                "fiv_grade_event_yn",
                "six_grade_event_yn",
                "updated_at",
            ],
        });
    }

    return {
        regionId: region.id,
        regionName: region.region_name,
        academicYear,
        targetSchoolCount: schools.length,
        savedCount: rowsToSave.length,
    };
}

async function generateAllAverageSchedules({ year } = {}) {
    const regions = await Region.findAll({
        order: [["id", "ASC"]],
    });

    const results = [];
    const failures = [];

    for (const region of regions) {
        try {
            const result = await generateAverageScheduleByRegion({
                regionName: region.region_name,
                year,
            });

            results.push({
                status: "success",
                ...result,
            });
        } catch (error) {
            failures.push({
                regionId: region.id,
                regionName: region.region_name,
                status: "failed",
                reason: error.message,
            });
        }
    }

    return {
        academicYear: resolveAcademicYear(year),
        status:
            failures.length === 0
                ? "success"
                : results.length === 0
                  ? "failed"
                  : "partial",
        successCount: results.length,
        failedCount: failures.length,
        savedCount: results.reduce((sum, item) => sum + item.savedCount, 0),
        results,
        failures,
    };
}

async function getAverageScheduleByRegion({ regionName, year, grade }) {
    const academicYear = resolveAcademicYear(year);

    const region = await Region.findOne({
        where: {
            region_name: regionName,
        },
    });

    if (!region) return [];

    const where = {
        region_id: region.id,
        academic_year: academicYear,
    };

    const gradeColumn = getGradeColumn(grade);
    if (gradeColumn) {
        where[gradeColumn] = "Y";
    }

    const rows = await AverageAcademicSchedule.findAll({
        where,
        order: [
            ["average_date", "ASC"],
            ["event_name", "ASC"],
        ],
    });

    return rows.map(toAverageScheduleResponse);
}

module.exports = {
    generateAverageScheduleByRegion,
    generateAllAverageSchedules,
    getAverageScheduleByRegion,
};
