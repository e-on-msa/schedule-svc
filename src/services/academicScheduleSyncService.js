// schedule-svc/src/services/averageScheduleService.js
const { Op } = require("sequelize");
const {
    Region,
    School,
    AcademicSchedule,
    AverageAcademicSchedule,
} = require("../../models");
const {
    extractDistrict,
    normalizeRegionName,
} = require("../utils/regionNormalizer");
const { groupSimilarEvents } = require("../utils/eventNormalizer");

function getCurrentAcademicYear() {
    const now = new Date();
    return now.getMonth() + 1 >= 3
        ? String(now.getFullYear())
        : String(now.getFullYear() - 1);
}

function resolveAcademicYear(year) {
    if (!year) return getCurrentAcademicYear();

    if (year === "prev") {
        return String(Number(getCurrentAcademicYear()) - 1);
    }

    return String(year);
}

function normalizeSchoolType(value = "") {
    const type = String(value || "").trim();

    if (type.includes("초")) return "ELEMENTARY";
    if (type.includes("중")) return "MIDDLE";

    return null;
}

function averageDate(events) {
    const timestamps = events
        .map((event) => new Date(event.schedule_date).getTime())
        .filter((time) => !Number.isNaN(time));

    if (timestamps.length === 0) return null;

    const avg =
        timestamps.reduce((sum, time) => sum + time, 0) / timestamps.length;

    return new Date(avg).toISOString().slice(0, 10);
}

function hasAnyGradeEvent(events, columnName) {
    return events.some((event) => event[columnName] === "Y") ? "Y" : "N";
}

function getGradeColumn(grade) {
    const map = {
        1: "one_grade_event_yn",
        2: "tw_grade_event_yn",
        3: "three_grade_event_yn",
        4: "fr_grade_event_yn",
        5: "fiv_grade_event_yn",
        6: "six_grade_event_yn",
    };

    return map[String(grade)];
}

function assertValidGrade(grade) {
    if (grade === undefined || grade === null || grade === "") return;

    if (!getGradeColumn(grade)) {
        const error = new Error("grade는 1~6 사이의 값이어야 합니다.");
        error.status = 400;
        throw error;
    }
}

function toResponse(row) {
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

async function findRegionByName(regionName) {
    const normalizedName = normalizeRegionName(regionName);

    const region = await Region.findOne({
        where: {
            region_name: normalizedName,
        },
    });

    if (!region) {
        const error = new Error(`지역을 찾을 수 없습니다: ${normalizedName}`);
        error.status = 404;
        throw error;
    }

    return region;
}

function groupSchoolsByRegionName(schools) {
    const map = new Map();

    for (const school of schools) {
        const regionName = extractDistrict(school.address);

        if (!regionName) continue;

        if (!map.has(regionName)) {
            map.set(regionName, []);
        }

        map.get(regionName).push(school);
    }

    return map;
}

async function getAllSchoolsGroupedByRegionName() {
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

    return groupSchoolsByRegionName(schools);
}

async function getSchoolsByRegionName(regionName) {
    const schoolsByRegionName = await getAllSchoolsGroupedByRegionName();
    return schoolsByRegionName.get(normalizeRegionName(regionName)) || [];
}

async function generateAverageScheduleByRegion({ regionName, year, schools }) {
    const academicYear = resolveAcademicYear(year);
    const region = await findRegionByName(regionName);

    const targetSchools =
        schools || (await getSchoolsByRegionName(region.region_name));

    const schoolCodesByType = {
        ELEMENTARY: [],
        MIDDLE: [],
    };

    for (const school of targetSchools) {
        const schoolType = normalizeSchoolType(school.school_type);

        if (!schoolType) continue;

        schoolCodesByType[schoolType].push(school.school_code);
    }

    let savedCount = 0;

    for (const [schoolType, schoolCodes] of Object.entries(schoolCodesByType)) {
        await AverageAcademicSchedule.destroy({
            where: {
                region_id: region.id,
                school_type: schoolType,
                academic_year: academicYear,
            },
        });

        if (schoolCodes.length === 0) continue;

        const schedules = await AcademicSchedule.findAll({
            where: {
                school_code: {
                    [Op.in]: schoolCodes,
                },
                academic_year: academicYear,
            },
            order: [
                ["schedule_date", "ASC"],
                ["event_name", "ASC"],
            ],
        });

        const groups = groupSimilarEvents(schedules, 0.6);

        const rows = groups
            .filter((group) => group.events.length >= 2)
            .map((group) => {
                const avgDate = averageDate(group.events);

                if (!avgDate) return null;

                return {
                    region_id: region.id,
                    school_type: schoolType,
                    academic_year: academicYear,
                    average_date: avgDate,
                    event_name: group.representativeName,
                    one_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "one_grade_event_yn",
                    ),
                    tw_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "tw_grade_event_yn",
                    ),
                    three_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "three_grade_event_yn",
                    ),
                    fr_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "fr_grade_event_yn",
                    ),
                    fiv_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "fiv_grade_event_yn",
                    ),
                    six_grade_event_yn: hasAnyGradeEvent(
                        group.events,
                        "six_grade_event_yn",
                    ),
                };
            })
            .filter(Boolean);

        if (rows.length > 0) {
            await AverageAcademicSchedule.bulkCreate(rows);
            savedCount += rows.length;
        }
    }

    return {
        regionId: region.id,
        regionName: region.region_name,
        academicYear,
        targetSchoolCount: targetSchools.length,
        savedCount,
    };
}

async function generateAllAverageSchedules({ year } = {}) {
    const academicYear = resolveAcademicYear(year);

    const regions = await Region.findAll({
        order: [["id", "ASC"]],
    });

    const schoolsByRegionName = await getAllSchoolsGroupedByRegionName();

    const results = [];
    const failures = [];

    for (const region of regions) {
        try {
            const result = await generateAverageScheduleByRegion({
                regionName: region.region_name,
                year: academicYear,
                schools: schoolsByRegionName.get(region.region_name) || [],
            });

            results.push(result);
        } catch (error) {
            failures.push({
                regionId: region.id,
                regionName: region.region_name,
                reason: error.message,
            });
        }
    }

    return {
        academicYear,
        successCount: results.length,
        failedCount: failures.length,
        savedCount: results.reduce((sum, result) => sum + result.savedCount, 0),
        results,
        failures,
    };
}

async function getAverageSchedules({ regionName, year, grade }) {
    assertValidGrade(grade);

    const academicYear = resolveAcademicYear(year);
    const region = await findRegionByName(regionName);

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

    return rows.map(toResponse);
}

module.exports = {
    generateAverageScheduleByRegion,
    generateAllAverageSchedules,
    getAverageSchedules,
};
