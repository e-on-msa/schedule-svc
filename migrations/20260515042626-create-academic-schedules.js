"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("academic_schedules", {
            academic_schedule_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            school_code: {
                allowNull: false,
                type: Sequelize.STRING(20),
            },
            atpt_code: {
                allowNull: false,
                type: Sequelize.STRING(20),
            },
            academic_year: {
                allowNull: false,
                type: Sequelize.STRING(10),
            },
            schedule_date: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            aa_ymd: {
                allowNull: false,
                type: Sequelize.STRING(8),
            },
            event_name: {
                allowNull: false,
                type: Sequelize.STRING(255),
            },
            event_content: {
                allowNull: true,
                type: Sequelize.TEXT,
            },
            subtracted_day_name: {
                allowNull: true,
                type: Sequelize.STRING(50),
            },
            one_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            tw_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            three_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            fr_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            fiv_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            six_grade_event_yn: {
                allowNull: true,
                type: Sequelize.STRING(1),
            },
            neis_load_dtm: {
                allowNull: true,
                type: Sequelize.STRING(50),
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        await queryInterface.addConstraint("academic_schedules", {
            fields: [
                "school_code",
                "atpt_code",
                "academic_year",
                "aa_ymd",
                "event_name",
            ],
            type: "unique",
            name: "uk_academic_schedule_school_year_date_event",
        });

        await queryInterface.addIndex(
            "academic_schedules",
            ["school_code", "academic_year", "aa_ymd"],
            {
                name: "idx_academic_schedule_lookup",
            },
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("academic_schedules");
    },
};