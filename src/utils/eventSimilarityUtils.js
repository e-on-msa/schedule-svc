// schedule-svc/src/utils/eventSimilarityUtils.js
function normalizeEventName(name = "") {
    return name
        .replace(/\s+/g, "")
        .replace(/[()（）\[\]{}]/g, "")
        .replace(/-/g, "")
        .trim();
}

function groupEventsByNormalizedName(events) {
    const map = new Map();

    for (const event of events) {
        const key = normalizeEventName(event.event_name);

        if (!key) continue;

        if (!map.has(key)) {
            map.set(key, {
                title: event.event_name,
                events: [],
            });
        }

        map.get(key).events.push(event);
    }

    return Array.from(map.values());
}

module.exports = {
    normalizeEventName,
    groupEventsByNormalizedName,
};
