const express = require('express');

const router = express.Router();

const takeAttendanceController = require('../controllers/take-attendance.controller');

router.post('/fill-attendance' , takeAttendanceController.fillAttendance);
router.post('/get-attendance-by-id' , takeAttendanceController.getAttendanceById);
router.post('/get-last-five-days-logs' , takeAttendanceController.getAttendanceById);
// router.post('/get-current-month-logs-count' , takeAttendanceController.getCurrentMonthLogCount);
router.post('/get-current-month-logs-by-page' , takeAttendanceController.getCurrentMonthLogByPage);
router.post('/get-todays-day-logs' , takeAttendanceController.getTodaysattendance);
router.post('/get-report-by-id' , takeAttendanceController.getReportById);
router.post('/get-report-by-flag' , takeAttendanceController.getReportByFlag);
//imported
router.post('/get-logs-by-single-date' , takeAttendanceController.getLogBySingleDate);
// router.get('/get-logs-by-name/:id' , takeAttendanceController.getLogByName);
// router.post('/get-logs-between-dates' , takeAttendanceController.getLogsBetweenDates );
// router.post('/get-logs-by-name-by-single-date' , takeAttendanceController.getLogsByNameBySingleDate);
// router.post('/get-logs-by-name-between-dates' , takeAttendanceController.getLogsByNameBetweenDates);


module.exports = router;
