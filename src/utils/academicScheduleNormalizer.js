// schedule-svc/src/utils/academicScheduleNormalizer.js
function toDateOnly(aaYmd) {
    const value = String(aaYmd ?? "");
    if (!/^\d{8}$/.test(value)) return null;

    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
    const isValid =
        !Number.isNaN(date.getTime()) &&
        date.getUTCFullYear() === Number(y) &&
        date.getUTCMonth() + 1 === Number(m) &&
        date.getUTCDate() === Number(d);

    return isValid ? `${y}-${m}-${d}` : null;
}

function normalizeAcademicSchedule(raw) {
    return {
        school_code: raw.SD_SCHUL_CODE,
        atpt_code: raw.ATPT_OFCDC_SC_CODE,
        academic_year: String(raw.AA_YMD).slice(0, 4),
        schedule_date: toDateOnly(raw.AA_YMD),
        aa_ymd: raw.AA_YMD,
        event_name: raw.EVENT_NM,
        event_content: raw.EVENT_CNTNT || null,
        subtracted_day_name: raw.SBTR_DD_SC_NM || null,
        one_grade_event_yn: raw.ONE_GRADE_EVENT_YN || null,
        tw_grade_event_yn: raw.TW_GRADE_EVENT_YN || null,
        three_grade_event_yn: raw.THREE_GRADE_EVENT_YN || null,
        fr_grade_event_yn: raw.FR_GRADE_EVENT_YN || null,
        fiv_grade_event_yn: raw.FIV_GRADE_EVENT_YN || null,
        six_grade_event_yn: raw.SIX_GRADE_EVENT_YN || null,
        neis_load_dtm: raw.LOAD_DTM || null,
    };
}

module.exports = {
    normalizeAcademicSchedule,
};
