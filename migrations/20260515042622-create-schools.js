"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("schools", {
            school_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            school_code: {
                allowNull: false,
                type: Sequelize.STRING(20),
                unique: true,
            },
            atpt_code: {
                allowNull: false,
                type: Sequelize.STRING(20),
            },
            region_id: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: "regions",
                    key: "region_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            school_name: {
                allowNull: false,
                type: Sequelize.STRING(100),
            },
            address: {
                allowNull: true,
                type: Sequelize.STRING(255),
            },
            school_type: {
                allowNull: false,
                type: Sequelize.STRING(30),
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

        await queryInterface.addIndex("schools", ["atpt_code", "school_code"], {
            name: "idx_schools_atpt_school",
        });

        await queryInterface.addIndex("schools", ["region_id"], {
            name: "idx_schools_region_id",
        });

        await queryInterface.addIndex("schools", ["school_type"], {
            name: "idx_schools_school_type",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("schools");
    },
};