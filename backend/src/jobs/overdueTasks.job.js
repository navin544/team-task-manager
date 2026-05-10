const Task = require('../models/Task');

function startOverdueTaskJob() {
  const run = async () => {
    await Task.updateMany(
      {
        dueDate: {
          $lt: new Date()
        },
        status: {
          $in: ['TODO', 'IN_PROGRESS']
        }
      },
      {
        $set: {
          status: 'OVERDUE'
        }
      }
    );
  };

  run().catch((error) => console.error('Failed to sync overdue tasks', error));

  setInterval(() => {
    run().catch((error) => console.error('Failed to sync overdue tasks', error));
  }, 1000 * 60 * 10);
}

module.exports = {
  startOverdueTaskJob
};
