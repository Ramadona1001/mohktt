import api from '../utils/api';

export const getProjectProgress = async (params = {}) => {
  const response = await api.get('/reports/project_progress/', { params });
  return response.data;
};

export const getTimeTracking = async (params = {}) => {
  const response = await api.get('/reports/time_tracking/', { params });
  return response.data;
};

export const getBudgetVsActual = async (params = {}) => {
  const response = await api.get('/reports/budget_vs_actual/', { params });
  return response.data;
};

export const getDocumentApprovalTimeline = async (params = {}) => {
  const response = await api.get('/reports/document_approval_timeline/', { params });
  return response.data;
};

export const getDepartmentPerformance = async (params = {}) => {
  const response = await api.get('/reports/department_performance/', { params });
  return response.data;
};

export const getDashboardSummary = async (params = {}) => {
  const response = await api.get('/reports/dashboard_summary/', { params });
  return response.data;
};

