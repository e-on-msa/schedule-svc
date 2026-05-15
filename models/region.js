// schedule-svc/models/region.js
"use strict";

module.exports = (sequelize, DataTypes) => {
    const Region = sequelize.define(
        "Region",
        {
            region_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            region_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
        },
        {
            tableName: "regions",
            underscored: true,
            timestamps: true,
        },
    );

    Region.associate = (models) => {
        Region.hasMany(models.School, {
            foreignKey: "region_id",
            sourceKey: "region_id",
            as: "schools",
        });

        Region.hasMany(models.AverageAcademicSchedule, {
            foreignKey: "region_id",
            sourceKey: "region_id",
            as: "averageSchedules",
        });
    };

    return Region;
};
