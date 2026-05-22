// schedule-svc/models/school.js
"use strict";

module.exports = (sequelize, DataTypes) => {
    const School = sequelize.define(
        "School",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            school_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            atpt_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            school_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            school_type: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
        },
        {
            tableName: "schools",
            underscored: true,
            timestamps: true,
        },
    );

    return School;
};
