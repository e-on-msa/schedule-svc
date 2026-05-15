// schedule-svc/models/averageAcademicSchedule.js
"use strict";

module.exports = (sequelize, DataTypes) => {
    const AverageAcademicSchedule = sequelize.define(
        "AverageAcademicSchedule",
        {
            average_academic_schedule_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            region_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            school_type: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            academic_year: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            average_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            event_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
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
        },
        {
            tableName: "average_academic_schedules",
            underscored: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: [
                        "region_id",
                        "school_type",
                        "academic_year",
                        "average_date",
                        "event_name",
                    ],
                    name: "uk_average_schedule_region_type_year_date_event",
                },
                {
                    fields: ["region_id", "school_type", "academic_year"],
                    name: "idx_average_schedule_lookup",
                },
            ],
        },
    );

    AverageAcademicSchedule.associate = (models) => {
        AverageAcademicSchedule.belongsTo(models.Region, {
            foreignKey: "region_id",
            targetKey: "region_id",
            as: "region",
        });
    };

    return AverageAcademicSchedule;
};
