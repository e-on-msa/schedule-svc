// schedule-svc/src/utils/academicScheduleResponseMapper.js
function toNeisLikeScheduleResponse(row) {
    return {
        ATPT_OFCDC_SC_CODE: row.atpt_code,
        SD_SCHUL_CODE: row.school_code,
        AY: row.academic_year,
        AA_YMD: row.aa_ymd,
        EVENT_NM: row.event_name,
        EVENT_CNTNT: row.event_content,
        SBTR_DD_SC_NM: row.subtracted_day_name,
        ONE_GRADE_EVENT_YN: row.one_grade_event_yn,
        TW_GRADE_EVENT_YN: row.tw_grade_event_yn,
        THREE_GRADE_EVENT_YN: row.three_grade_event_yn,
        FR_GRADE_EVENT_YN: row.fr_grade_event_yn,
        FIV_GRADE_EVENT_YN: row.fiv_grade_event_yn,
        SIX_GRADE_EVENT_YN: row.six_grade_event_yn,
        LOAD_DTM: row.neis_load_dtm,
    };
}

module.exports = {
    toNeisLikeScheduleResponse,
};
