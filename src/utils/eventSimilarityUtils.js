// schedule-svc/src/utils/eventSimilarityUtils.js

const stringSimilarity = require("string-similarity");

function normalizeEventName(value = "") {
    return String(value || "")
        .replace(/\s+/g, "")
        .replace(/[()（）[\]{}]/g, "")
        .replace(/[-_/·ㆍ.]/g, "")
        .replace(/행사/g, "")
        .trim();
}

function groupSimilarEvents(events, threshold = 0.6) {
    const groups = [];

    for (const event of events) {
        const normalizedName = normalizeEventName(event.event_name);

        if (!normalizedName) continue;

        let matchedGroup = null;

        for (const group of groups) {
            const similarity = stringSimilarity.compareTwoStrings(
                normalizedName,
                group.normalizedName,
            );

            if (similarity >= threshold) {
                matchedGroup = group;
                break;
            }
        }

        if (matchedGroup) {
            matchedGroup.events.push(event);
            continue;
        }

        groups.push({
            representativeName: event.event_name,
            normalizedName,
            events: [event],
        });
    }

    return groups;
}

module.exports = {
    normalizeEventName,
    groupSimilarEvents,
};
