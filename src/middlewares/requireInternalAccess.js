// schedule-svc/src/middlewares/requireInternalAccess.js
function requireInternalAccess(req, res, next) {
    const secret = req.headers["x-internal-secret"];

    if (!secret) {
        return res.status(403).json({
            success: false,
            message: "Internal API access denied",
        });
    }

    if (secret !== process.env.INTERNAL_API_SECRET) {
        return res.status(403).json({
            success: false,
            message: "Invalid internal API secret",
        });
    }

    next();
}

module.exports = requireInternalAccess;
