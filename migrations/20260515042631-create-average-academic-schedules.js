"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("average_academic_schedules", {
            average_academic_schedule_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            region_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: "regions",
                    key: "region_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            school_type: {
                allowNull: false,
                type: Sequelize.STRING(30),
            },
            academic_year: {
                allowNull: false,
                type: Sequelize.STRING(10),
            },
            average_date: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            event_name: {
                allowNull: false,
                type: Sequelize.STRING(255),
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

        await queryInterface.addConstraint("average_academic_schedules", {
            fields: [
                "region_id",
                "school_type",
                "academic_year",
                "average_date",
                "event_name",
            ],
            type: "unique",
            name: "uk_average_schedule_region_type_year_date_event",
        });

        await queryInterface.addIndex(
            "average_academic_schedules",
            ["region_id", "school_type", "academic_year"],
            {
                name: "idx_average_schedule_lookup",
            },
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("average_academic_schedules");
    },
};