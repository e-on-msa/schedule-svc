// schedule-svc/src/middlewares/requireInternalAccess.js
function requireInternalAccess(req, res, next) {
    const secret = req.headers["x-internal-secret"];
    const configuredSecret = process.env.INTERNAL_API_SECRET;

    if (!configuredSecret) {
        return res.status(500).json({
            success: false,
            message: "Internal API secret is not configured",
        });
    }

    if (!secret || secret !== configuredSecret) {
        return res.status(403).json({
            success: false,
            message: "Internal API access denied",
        });
    }

    next();
}

module.exports = requireInternalAccess;
