const {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  removeProjectMember,
  updateProject
} = require('../services/projectService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const createProjectController = catchAsync(async (req, res) => {
  const project = await createProject(req.validated.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Project created successfully',
    data: project
  });
});

const getProjectsController = catchAsync(async (req, res) => {
  const result = await listProjects(req.user, req.validated.query || {});

  return sendSuccess(res, {
    message: 'Projects fetched successfully',
    data: result
  });
});

const getProjectController = catchAsync(async (req, res) => {
  const project = await getProjectById(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Project fetched successfully',
    data: project
  });
});

const updateProjectController = catchAsync(async (req, res) => {
  const project = await updateProject(req.params.id, req.validated.body, req.user);

  return sendSuccess(res, {
    message: 'Project updated successfully',
    data: project
  });
});

const deleteProjectController = catchAsync(async (req, res) => {
  await deleteProject(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Project deleted successfully'
  });
});

const addProjectMemberController = catchAsync(async (req, res) => {
  const member = await addProjectMember(req.params.id, req.validated.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Project member added successfully',
    data: member
  });
});

const removeProjectMemberController = catchAsync(async (req, res) => {
  await removeProjectMember(req.params.id, req.params.userId, req.user);

  return sendSuccess(res, {
    message: 'Project member removed successfully'
  });
});

module.exports = {
  addProjectMemberController,
  createProjectController,
  deleteProjectController,
  getProjectController,
  getProjectsController,
  removeProjectMemberController,
  updateProjectController
};
