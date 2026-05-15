// schedule-svc/models/academicSchedule.js
"use strict";

module.exports = (sequelize, DataTypes) => {
    const AcademicSchedule = sequelize.define(
        "AcademicSchedule",
        {
            academic_schedule_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            school_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            atpt_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            academic_year: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            schedule_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            aa_ymd: {
                type: DataTypes.STRING(8),
                allowNull: false,
            },
            event_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            event_content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            subtracted_day_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            one_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            tw_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            three_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            fr_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            fiv_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            six_grade_event_yn: {
                type: DataTypes.STRING(1),
                allowNull: true,
            },
            neis_load_dtm: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
        },
        {
            tableName: "academic_schedules",
            underscored: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: [
                        "school_code",
                        "atpt_code",
                        "academic_year",
                        "aa_ymd",
                        "event_name",
                    ],
                    name: "uk_academic_schedule_school_year_date_event",
                },
                {
                    fields: ["school_code", "academic_year", "aa_ymd"],
                    name: "idx_academic_schedule_lookup",
                },
            ],
        },
    );

    return AcademicSchedule;
};
