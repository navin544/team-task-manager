const { getDashboardSummary } = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const getDashboardSummaryController = catchAsync(async (req, res) => {
  const summary = await getDashboardSummary(req.user);

  return sendSuccess(res, {
    message: 'Dashboard analytics fetched successfully',
    data: summary
  });
});

module.exports = {
  getDashboardSummaryController
};
