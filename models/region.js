// schedule-svc/models/region.js
"use strict";

module.exports = (sequelize, DataTypes) => {
    const Region = sequelize.define(
        "Region",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            region_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            tableName: "regions",
            underscored: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["region_name"],
                    name: "uk_regions_region_name",
                },
            ],
        },
    );

    Region.associate = (models) => {
        Region.hasMany(models.AverageAcademicSchedule, {
            foreignKey: "region_id",
            as: "averageSchedules",
        });
    };

    return Region;
};
