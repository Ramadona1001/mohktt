import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuperAdminStats,
  getAllCompanies,
  getAllUsers,
  getAllContractors,
  toggleCompanyStatus,
  updateUserRole,
  assignUserToCompany,
  createCompanyAsSuperAdmin,
  createUserAsSuperAdmin,
  createContractorAsSuperAdmin,
  updateCompanyAsSuperAdmin,
  deleteCompanyAsSuperAdmin,
  updateUserAsSuperAdmin,
  deleteUserAsSuperAdmin,
  updateContractorAsSuperAdmin,
  deleteContractorAsSuperAdmin,
  getAllDepartments,
  createDepartmentAsSuperAdmin,
  updateDepartmentAsSuperAdmin,
  deleteDepartmentAsSuperAdmin,
  assignWorkersToDepartment,
  getSuperAdminNotifications,
  getSuperAdminUnreadNotificationsCount,
  getRolesPermissions,
  updateRolePermissions,
  resetRolePermissions,
} from '../services/authService'
import {
  Building2,
  Users,
  Briefcase,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserPlus,
  Building,
  Briefcase as BriefcaseIcon,
  Shield,
  BarChart3,
  Search,
  Filter,
  X,
  Key,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  UserCog,
  HardHat,
  FileText,
  ClipboardList,
  Bell,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Create Modal Component (keep this component as is)
// Create Modal Component
function CreateModal({ type, onClose, onCreateCompany, onCreateUser, onCreateContractor, onCreateDepartment, companies, contractors, isLoading, initialRole }) {
  const roleOptions = [
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'CONTRACTOR',
    'WORKER',
    'DOCUMENT_CONTROLLER',
    'CONSULTANT',
  ]

  const [formData, setFormData] = useState({
    // Company
    name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    logo: null,
    other_info: '',
    // User
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: initialRole || 'WORKER',
    company: '',
    // Contractor
    contractor_name: '',
    contractor_email: '',
    contractor_phone: '',
    contractor_address: '',
    company_id: '',
    // Department
    department_name: '',
    department_description: '',
    department_contractor: '',
  })

  // Reset and update form data when modal opens or role changes
  useEffect(() => {
    if (type === 'user') {
      setFormData(prev => ({
        ...prev,
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: initialRole || 'WORKER',
        company: '',
      }))
    } else if (type === 'company') {
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        phone_number: '',
        address: '',
        password: '',
        logo: null,
        other_info: '',
      }))
    } else if (type === 'contractor') {
      setFormData(prev => ({
        ...prev,
        contractor_name: '',
        contractor_email: '',
        contractor_phone: '',
        contractor_address: '',
        company_id: '',
      }))
    } else if (type === 'department') {
      setFormData(prev => ({
        ...prev,
        department_name: '',
        department_description: '',
        department_contractor: '',
      }))
    }
  }, [type, initialRole])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (type === 'company') {
      const companyData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password,
        other_info: formData.other_info,
      }
      
      // If logo is selected, create FormData
      if (formData.logo) {
        const formDataObj = new FormData()
        Object.keys(companyData).forEach(key => {
          if (companyData[key] !== null && companyData[key] !== '') {
            formDataObj.append(key, companyData[key])
          }
        })
        formDataObj.append('logo', formData.logo)
        onCreateCompany(formDataObj)
      } else {
        onCreateCompany(companyData)
      }
    } else if (type === 'user') {
      onCreateUser({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        company: formData.company || null,
      })
    } else if (type === 'contractor') {
      onCreateContractor({
        name: formData.contractor_name,
        email: formData.contractor_email,
        phone_number: formData.contractor_phone,
        address: formData.contractor_address,
        company: formData.company_id,
      })
    } else if (type === 'department') {
      onCreateDepartment({
        name: formData.department_name,
        description: formData.department_description,
        contractor: formData.department_contractor,
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-md max-h-[95vh] my-auto overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Create {type === 'company' ? 'Company' : type === 'user' ? 'User' : type === 'contractor' ? 'Contractor' : 'Department'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {type === 'company' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Company login password"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {formData.logo && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Selected: {formData.logo.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Other Info (Optional)</label>
                <textarea
                  value={formData.other_info}
                  onChange={(e) => setFormData({ ...formData, other_info: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                  placeholder="Additional company information"
                />
              </div>
            </>
          )}

          {type === 'user' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Company</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'contractor' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contractor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contractor_name}
                  onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contractor_email}
                  onChange={(e) => setFormData({ ...formData, contractor_email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contractor_phone}
                  onChange={(e) => setFormData({ ...formData, contractor_phone: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.contractor_address}
                  onChange={(e) => setFormData({ ...formData, contractor_address: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company *</label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Company</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'department' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.department_description}
                  onChange={(e) => setFormData({ ...formData, department_description: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contractor *</label>
                <select
                  required
                  value={formData.department_contractor}
                  onChange={(e) => setFormData({ ...formData, department_contractor: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Contractor</option>
                  {contractors?.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Modal Component
function EditModal({ type, data, onClose, onUpdateCompany, onUpdateUser, onUpdateContractor, companies, isLoading }) {
  const roleOptions = [
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'CONTRACTOR',
    'WORKER',
    'DOCUMENT_CONTROLLER',
    'CONSULTANT',
  ]

  const [formData, setFormData] = useState({
    // Company
    name: data?.name || '',
    email: data?.email || '',
    phone_number: data?.phone_number || '',
    address: data?.address || '',
    password: '',
    logo: null,
    other_info: data?.other_info || '',
    // User
    username: data?.username || '',
    email: data?.email || '',
    password: '',
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    role: data?.role || 'WORKER',
    company: data?.company || (typeof data?.company === 'object' && data?.company?.id ? data.company.id : ''),
    // Contractor
    contractor_name: data?.name || '',
    contractor_email: data?.email || '',
    contractor_phone: data?.phone_number || '',
    contractor_address: data?.address || '',
    company_id: data?.company || (typeof data?.company === 'object' && data?.company?.id ? data.company.id : ''),
  })

  // Update form data when data changes
  useEffect(() => {
    if (data) {
      setFormData({
        // Company
        name: data?.name || '',
        email: data?.email || '',
        phone_number: data?.phone_number || '',
        address: data?.address || '',
        password: '',
        logo: null,
        other_info: data?.other_info || '',
        // User
        username: data?.username || '',
        email: data?.email || '',
        password: '',
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        role: data?.role || 'WORKER',
        company: data?.company || (typeof data?.company === 'object' && data?.company?.id ? data.company.id : ''),
        // Contractor
        contractor_name: data?.name || '',
        contractor_email: data?.email || '',
        contractor_phone: data?.phone_number || '',
        contractor_address: data?.address || '',
        company_id: data?.company || (typeof data?.company === 'object' && data?.company?.id ? data.company.id : ''),
      })
    }
  }, [data])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (type === 'company') {
      const companyData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        other_info: formData.other_info,
      }
      
      // Only add password if provided
      if (formData.password) {
        companyData.password = formData.password
      }
      
      // If logo is selected, create FormData
      if (formData.logo) {
        const formDataObj = new FormData()
        Object.keys(companyData).forEach(key => {
          if (companyData[key] !== null && companyData[key] !== '') {
            formDataObj.append(key, companyData[key])
          }
        })
        formDataObj.append('logo', formData.logo)
        onUpdateCompany({ companyId: data.id, companyData: formDataObj })
      } else {
        onUpdateCompany({ companyId: data.id, companyData })
      }
    } else if (type === 'user') {
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      }
      
      // Only add password if provided
      if (formData.password) {
        userData.password = formData.password
      }
      
      // Only add company if selected
      if (formData.company) {
        userData.company = formData.company
      }
      
      onUpdateUser({ userId: data.id, userData })
    } else if (type === 'contractor') {
      const contractorData = {
        name: formData.contractor_name,
        email: formData.contractor_email,
        phone_number: formData.contractor_phone,
        address: formData.contractor_address,
        company: formData.company_id,
      }
      
      onUpdateContractor({ contractorId: data.id, contractorData })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Edit {type === 'company' ? 'Company' : type === 'user' ? 'User' : 'Contractor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {type === 'company' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password (Leave empty to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {data?.logo && !formData.logo && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Current logo: {data.logo}</p>
                )}
                {formData.logo && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">New: {formData.logo.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Other Info (Optional)</label>
                <textarea
                  value={formData.other_info}
                  onChange={(e) => setFormData({ ...formData, other_info: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                  placeholder="Additional company information"
                />
              </div>
            </>
          )}

          {type === 'user' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password (Leave empty to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Company</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'contractor' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contractor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contractor_name}
                  onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contractor_email}
                  onChange={(e) => setFormData({ ...formData, contractor_email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contractor_phone}
                  onChange={(e) => setFormData({ ...formData, contractor_phone: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.contractor_address}
                  onChange={(e) => setFormData({ ...formData, contractor_address: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company *</label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Company</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Assign Workers Modal Component
function AssignWorkersModal({ department, workers, onClose, onAssign, isLoading }) {
  const [selectedWorkers, setSelectedWorkers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Get workers already assigned to this department
  const assignedWorkerIds = workers?.filter(w => w.department === department?.id).map(w => w.id) || []

  // Filter workers by search term
  const filteredWorkers = workers?.filter((worker) => {
    if (worker.role !== 'WORKER') return false
    const matchesSearch = !searchTerm || 
      worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${worker.first_name} ${worker.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

  // Initialize selected workers with already assigned workers
  useEffect(() => {
    if (department && assignedWorkerIds.length > 0) {
      setSelectedWorkers([...assignedWorkerIds])
    }
  }, [department])

  const handleToggleWorker = (workerId) => {
    setSelectedWorkers(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId)
      } else {
        return [...prev, workerId]
      }
    })
  }

  const handleSelectAll = () => {
    const allWorkerIds = filteredWorkers.map(w => w.id)
    if (selectedWorkers.length === filteredWorkers.length) {
      setSelectedWorkers([])
    } else {
      setSelectedWorkers(allWorkerIds)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedWorkers.length === 0) {
      toast.error('Please select at least one worker')
      return
    }
    onAssign({ departmentId: department.id, workerIds: selectedWorkers })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-2xl max-h-[95vh] my-auto overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Assign Workers to {department?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {selectedWorkers.length === filteredWorkers.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-600">
              {selectedWorkers.length} of {filteredWorkers.length} selected
            </span>
          </div>

          {/* Workers List */}
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {filteredWorkers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No workers found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredWorkers.map((worker) => {
                  const isSelected = selectedWorkers.includes(worker.id)
                  const isAssigned = assignedWorkerIds.includes(worker.id)
                  return (
                    <div
                      key={worker.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer ${
                        isSelected ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleToggleWorker(worker.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleWorker(worker.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {worker.first_name} {worker.last_name}
                            </p>
                            {isAssigned && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Currently Assigned
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{worker.email}</p>
                          <p className="text-xs text-gray-500">{worker.username}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={isLoading || selectedWorkers.length === 0}
              className="btn btn-primary flex-1 text-sm sm:text-base py-2 sm:py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Assigning...' : `Assign ${selectedWorkers.length} Worker${selectedWorkers.length !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SuperAdmin() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState(null)
  const [initialRole, setInitialRole] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'inactive'
  const [showEditModal, setShowEditModal] = useState(false)
  const [editType, setEditType] = useState(null)
  const [editData, setEditData] = useState(null)
  const [editingPermissions, setEditingPermissions] = useState(null) // { role: 'COMPANY_ADMIN', permissions: {...} }
  const [localPermissions, setLocalPermissions] = useState({}) // Local state for editing permissions

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: getSuperAdminStats,
  })

  // Fetch all companies
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['super-admin-companies'],
    queryFn: getAllCompanies,
    enabled: activeTab === 'companies',
  })

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: getAllUsers,
    enabled: activeTab === 'users' || activeTab === 'project-managers' || activeTab === 'workers' || activeTab === 'consultants' || activeTab === 'document-controllers',
  })

  // Fetch all contractors
  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['super-admin-contractors'],
    queryFn: getAllContractors,
    enabled: activeTab === 'contractors',
  })

  // Fetch all departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['super-admin-departments'],
    queryFn: getAllDepartments,
    enabled: activeTab === 'departments',
  })

  // Fetch roles and permissions
  const { data: rolesPermissions, isLoading: rolesPermissionsLoading } = useQuery({
    queryKey: ['roles-permissions'],
    queryFn: getRolesPermissions,
    enabled: activeTab === 'roles-permissions',
  })

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['super-admin-notifications'],
    queryFn: () => getSuperAdminNotifications(),
    enabled: activeTab === 'dashboard',
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: unreadCount } = useQuery({
    queryKey: ['super-admin-unread-count'],
    queryFn: getSuperAdminUnreadNotificationsCount,
    enabled: activeTab === 'dashboard',
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Initialize local permissions when rolesPermissions data is loaded
  useEffect(() => {
    if (rolesPermissions?.permissions) {
      const initialPermissions = {}
      Object.keys(rolesPermissions.permissions).forEach((role) => {
        initialPermissions[role] = { ...rolesPermissions.permissions[role].permissions }
      })
      setLocalPermissions(initialPermissions)
    }
  }, [rolesPermissions])

  // Mutations
  const toggleCompanyMutation = useMutation({
    mutationFn: ({ companyId, isActive }) => toggleCompanyStatus(companyId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-companies'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Company status updated!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update company status')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleData }) => updateUserRole(userId, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users'])
      toast.success('User role updated!')
      setEditingItem(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update user role')
    },
  })

  const assignCompanyMutation = useMutation({
    mutationFn: ({ userId, companyId }) => assignUserToCompany(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users'])
      toast.success('User assigned to company!')
      setEditingItem(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to assign user')
    },
  })

  const createCompanyMutation = useMutation({
    mutationFn: createCompanyAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-companies'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Company created!')
      setShowCreateModal(false)
      setCreateType(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create company')
    },
  })

  const createUserMutation = useMutation({
    mutationFn: createUserAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('User created!')
      setShowCreateModal(false)
      setCreateType(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create user')
    },
  })

  const createContractorMutation = useMutation({
    mutationFn: createContractorAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-contractors'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Contractor created!')
      setShowCreateModal(false)
      setCreateType(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create contractor')
    },
  })

  // Update mutations
  const updateCompanyMutation = useMutation({
    mutationFn: ({ companyId, companyData }) => updateCompanyAsSuperAdmin(companyId, companyData),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-companies'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Company updated!')
      setShowEditModal(false)
      setEditData(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update company')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => updateUserAsSuperAdmin(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('User updated!')
      setShowEditModal(false)
      setEditData(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    },
  })

  const updateContractorMutation = useMutation({
    mutationFn: ({ contractorId, contractorData }) => updateContractorAsSuperAdmin(contractorId, contractorData),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-contractors'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Contractor updated!')
      setShowEditModal(false)
      setEditData(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update contractor')
    },
  })

  // Delete mutations
  const deleteCompanyMutation = useMutation({
    mutationFn: deleteCompanyAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-companies'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Company deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete company')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUserAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('User deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })

  const deleteContractorMutation = useMutation({
    mutationFn: deleteContractorAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-contractors'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Contractor deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete contractor')
    },
  })

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: createDepartmentAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-departments'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Department created!')
      setShowCreateModal(false)
      setCreateType(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create department')
    },
  })

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ departmentId, departmentData }) => updateDepartmentAsSuperAdmin(departmentId, departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-departments'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Department updated!')
      setShowEditModal(false)
      setEditData(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update department')
    },
  })

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartmentAsSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-departments'])
      queryClient.invalidateQueries(['super-admin-stats'])
      toast.success('Department deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete department')
    },
  })

  const assignWorkersMutation = useMutation({
    mutationFn: ({ departmentId, workerIds }) => assignWorkersToDepartment(departmentId, workerIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-departments'])
      queryClient.invalidateQueries(['super-admin-users'])
      toast.success('Workers assigned to department!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to assign workers')
    },
  })

  // Permissions mutations
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ role, permissions }) => {
      console.log('=== Mutation Function ===')
      console.log('Role:', role)
      console.log('Permissions:', permissions)
      console.log('Permissions type:', typeof permissions)
      console.log('Number of categories:', Object.keys(permissions).length)
      return updateRolePermissions(role, permissions)
    },
    onSuccess: (data) => {
      console.log('=== Success Response ===')
      console.log('Response data:', data)
      queryClient.invalidateQueries(['roles-permissions'])
      const count = data?.updated_count || data?.saved_count || 0
      toast.success(`Permissions updated successfully! ${count} permission${count !== 1 ? 's' : ''} saved.`)
      setEditingPermissions(null)
      // Reset local permissions after successful save
      setLocalPermissions({})
    },
    onError: (error) => {
      console.error('=== Error Response ===')
      console.error('Error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to update permissions'
      toast.error(errorMessage)
    },
  })

  const resetPermissionsMutation = useMutation({
    mutationFn: (role) => resetRolePermissions(role),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles-permissions'])
      toast.success('Permissions reset to defaults!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reset permissions')
    },
  })

  const handleToggleCompany = (companyId, currentStatus) => {
    toggleCompanyMutation.mutate({ companyId, isActive: !currentStatus })
  }

  const handleUpdateRole = (userId, roleData) => {
    updateRoleMutation.mutate({ userId, roleData })
  }

  const handleAssignCompany = (userId, companyId) => {
    assignCompanyMutation.mutate({ userId, companyId })
  }

  // Edit handlers
  const handleEditCompany = (company) => {
    setEditType('company')
    setEditData(company)
    setShowEditModal(true)
  }

  const handleEditUser = (user) => {
    setEditType('user')
    setEditData(user)
    setShowEditModal(true)
  }

  const handleEditContractor = (contractor) => {
    setEditType('contractor')
    setEditData(contractor)
    setShowEditModal(true)
  }

  // Delete handlers
  const handleDeleteCompany = (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      deleteCompanyMutation.mutate(companyId)
    }
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleDeleteContractor = (contractorId) => {
    if (window.confirm('Are you sure you want to delete this contractor? This action cannot be undone.')) {
      deleteContractorMutation.mutate(contractorId)
    }
  }

  // Department handlers
  const handleEditDepartment = (department) => {
    setEditType('department')
    setEditData(department)
    setShowEditModal(true)
  }

  const handleDeleteDepartment = (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      deleteDepartmentMutation.mutate(departmentId)
    }
  }

  const handleAssignWorkers = (department) => {
    setEditType('assign-workers')
    setEditData(department)
    setShowEditModal(true)
  }

  // Permissions handlers
  const handleEditPermissions = (role) => {
    console.log('=== Edit Permissions ===')
    console.log('Role:', role)
    console.log('Roles Permissions:', rolesPermissions?.permissions?.[role])
    
    setEditingPermissions(role)
    // Initialize local permissions for this role - deep copy to avoid reference issues
    if (rolesPermissions?.permissions?.[role]) {
      const rolePerms = rolesPermissions.permissions[role].permissions || {}
      console.log('Role Perms:', rolePerms)
      const deepCopy = {}
      Object.keys(rolePerms).forEach(category => {
        deepCopy[category] = Array.isArray(rolePerms[category]) ? [...rolePerms[category]] : []
      })
      console.log('Deep Copy:', deepCopy)
      setLocalPermissions(prev => ({
        ...prev,
        [role]: deepCopy
      }))
    } else {
      // Initialize empty permissions if role not found
      console.log('No permissions found for role, initializing empty')
      setLocalPermissions(prev => ({
        ...prev,
        [role]: {}
      }))
    }
  }

  const handleTogglePermission = (role, category, action) => {
    console.log('Toggle permission:', { role, category, action })
    setLocalPermissions(prev => {
      // Create a new object to ensure React detects the change
      const newPerms = { ...prev }
      
      // Create new role object if it doesn't exist
      if (!newPerms[role]) {
        newPerms[role] = {}
      } else {
        newPerms[role] = { ...newPerms[role] }
      }
      
      // Create new category array if it doesn't exist
      if (!newPerms[role][category]) {
        newPerms[role][category] = []
      } else {
        newPerms[role][category] = [...newPerms[role][category]]
      }
      
      const categoryPerms = newPerms[role][category]
      const actionIndex = categoryPerms.indexOf(action)
      
      console.log('Before toggle:', { categoryPerms, actionIndex, action })
      
      if (actionIndex > -1) {
        // Remove permission
        newPerms[role][category] = categoryPerms.filter(a => a !== action)
        console.log('Removed permission. New array:', newPerms[role][category])
      } else {
        // Add permission
        newPerms[role][category] = [...categoryPerms, action]
        console.log('Added permission. New array:', newPerms[role][category])
      }
      
      console.log('Updated localPermissions:', newPerms)
      return newPerms
    })
  }

  const handleSelectAllCategory = (role, category) => {
    const allActions = rolesPermissions?.permission_actions || []
    const currentPerms = localPermissions[role]?.[category] || []
    const allSelected = allActions.every(action => currentPerms.includes(action))
    
    setLocalPermissions(prev => {
      const newPerms = { ...prev }
      
      if (!newPerms[role]) {
        newPerms[role] = {}
      } else {
        newPerms[role] = { ...newPerms[role] }
      }
      
      if (allSelected) {
        // Deselect all
        newPerms[role][category] = []
      } else {
        // Select all
        newPerms[role][category] = [...allActions]
      }
      
      return newPerms
    })
  }

  const handleSavePermissions = (role) => {
    if (!role) {
      toast.error('No role selected')
      return
    }
    
    const permissions = localPermissions[role] || {}
    console.log('=== Saving Permissions ===')
    console.log('Role:', role)
    console.log('Local Permissions:', localPermissions)
    console.log('Permissions for role:', permissions)
    
    // Ensure all categories are arrays and filter out empty arrays
    const cleanedPermissions = {}
    Object.keys(permissions).forEach(category => {
      const actions = Array.isArray(permissions[category]) 
        ? permissions[category] 
        : []
      // Only include categories that have at least one action
      if (actions.length > 0) {
        cleanedPermissions[category] = actions
      }
    })
    
    console.log('Cleaned Permissions:', cleanedPermissions)
    console.log('Number of categories:', Object.keys(cleanedPermissions).length)
    
    if (Object.keys(cleanedPermissions).length === 0) {
      toast.error('No permissions to save. Please select at least one permission.')
      return
    }
    
    console.log('Sending to API:', { role, permissions: cleanedPermissions })
    updatePermissionsMutation.mutate({ role, permissions: cleanedPermissions })
  }

  const handleResetPermissions = (role) => {
    if (window.confirm(`Are you sure you want to reset permissions for ${role} to defaults?`)) {
      resetPermissionsMutation.mutate(role)
      setEditingPermissions(null)
    }
  }

  const handleCancelEditPermissions = () => {
    setEditingPermissions(null)
    // Reset local permissions to original
    if (rolesPermissions?.permissions) {
      const initialPermissions = {}
      Object.keys(rolesPermissions.permissions).forEach((role) => {
        initialPermissions[role] = { ...rolesPermissions.permissions[role].permissions }
      })
      setLocalPermissions(initialPermissions)
    }
  }

  // Filter functions
  const filteredCompanies = companies?.filter((company) => {
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && company.is_active) ||
      (filterStatus === 'inactive' && !company.is_active)
    return matchesSearch && matchesFilter
  }) || []

  // Helper function to filter users by role
  const filterUsersByRole = (usersList, role) => {
    return usersList?.filter((user) => {
      const matchesRole = !role || user.role === role
      const matchesSearch = !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'active' && user.is_active) ||
        (filterStatus === 'inactive' && !user.is_active)
      return matchesRole && matchesSearch && matchesFilter
    }) || []
  }

  const filteredUsers = filterUsersByRole(users, null)
  const filteredProjectManagers = filterUsersByRole(users, 'PROJECT_MANAGER')
  const filteredWorkers = filterUsersByRole(users, 'WORKER')
  const filteredConsultants = filterUsersByRole(users, 'CONSULTANT')
  const filteredDocumentControllers = filterUsersByRole(users, 'DOCUMENT_CONTROLLER')

  const filteredContractors = contractors?.filter((contractor) => {
    const matchesSearch = !searchTerm || 
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && contractor.is_active) ||
      (filterStatus === 'inactive' && !contractor.is_active)
    return matchesSearch && matchesFilter
  }) || []

  const filteredDepartments = departments?.filter((department) => {
    const matchesSearch = !searchTerm || 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && department.is_active) ||
      (filterStatus === 'inactive' && !department.is_active)
    return matchesSearch && matchesFilter
  }) || []

  const roleOptions = [
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'CONTRACTOR',
    'WORKER',
    'DOCUMENT_CONTROLLER',
    'CONSULTANT',
  ]

  // Add navigation tabs
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'companies', name: 'Companies', icon: Building2 },
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'project-managers', name: 'Project Managers', icon: ClipboardList },
    { id: 'workers', name: 'Workers', icon: HardHat },
    { id: 'consultants', name: 'Consultants', icon: UserCog },
    { id: 'document-controllers', name: 'Document Controllers', icon: FileText },
    { id: 'contractors', name: 'Contractors', icon: Briefcase },
    { id: 'departments', name: 'Departments', icon: Building },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: Key },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2 sm:space-x-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
            <span>Super Admin Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all companies, users, and contractors</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Companies</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_companies || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    {stats?.active_companies || 0} active
                  </p>
                </div>
                <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_users || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Contractors</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_contractors || 0}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Projects</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_projects || 0}
                  </p>
                </div>
                <BriefcaseIcon className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Role-specific Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Project Managers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_project_managers || 0}
                  </p>
                </div>
                <ClipboardList className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Workers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_workers || 0}
                  </p>
                </div>
                <HardHat className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Consultants</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_consultants || 0}
                  </p>
                </div>
                <UserCog className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Document Controllers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {statsLoading ? '...' : stats?.total_document_controllers || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Users by Role */}
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Users by Role</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {roleOptions.map((role) => (
                <div key={role} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-primary-600">
                    {stats?.users_by_role?.[role] || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 break-words">{role.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <span>Recent Notifications</span>
                {unreadCount?.unread_count > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount.unread_count} new
                  </span>
                )}
              </h3>
            </div>
            {notificationsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading notifications...</div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      notification.is_read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-primary-50 border-primary-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">All Companies</h2>
              <button
                onClick={() => {
                  setCreateType('company')
                  setInitialRole(null)
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Company</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {companiesLoading ? (
            <div className="text-center py-12">Loading companies...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{company.name}</td>
                          <td className="px-6 py-4 text-gray-600">{company.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                company.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {company.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCompany(company)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleCompany(company.id, company.is_active)}
                                className={`p-2 rounded ${
                                  company.is_active
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={company.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {company.is_active ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(company.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{company.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          company.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleCompany(company.id, company.is_active)}
                        className={`p-2 rounded ${
                          company.is_active
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={company.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {company.is_active ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No companies found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">All Users</h2>
              <button
                onClick={() => {
                  setCreateType('user')
                  setInitialRole(null)
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem?.id === user.id && editingItem?.type === 'role' ? (
                            <select
                              value={editingItem.data.role || user.role}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, role: e.target.value },
                                })
                              }
                              className="px-2 py-1 border rounded text-sm"
                              onBlur={() => {
                                if (editingItem.data.role !== user.role) {
                                  handleUpdateRole(user.id, editingItem.data)
                                } else {
                                  setEditingItem(null)
                                }
                              }}
                              autoFocus
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 cursor-pointer"
                              onClick={() =>
                                setEditingItem({
                                  id: user.id,
                                  type: 'role',
                                  data: { role: user.role, is_active: user.is_active, is_staff: user.is_staff },
                                })
                              }
                            >
                              {user.role.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {editingItem?.id === user.id && editingItem?.type === 'company' ? (
                            <select
                              value={editingItem.data.company_id || user.company || ''}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, company_id: e.target.value },
                                })
                              }
                              className="px-2 py-1 border rounded text-sm"
                              onBlur={() => {
                                if (editingItem.data.company_id !== (user.company || '')) {
                                  handleAssignCompany(user.id, editingItem.data.company_id || null)
                                } else {
                                  setEditingItem(null)
                                }
                              }}
                              autoFocus
                            >
                              <option value="">No Company</option>
                              {companies?.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-primary-600"
                              onClick={() =>
                                setEditingItem({
                                  id: user.id,
                                  type: 'company',
                                  data: { company_id: user.company || '' },
                                })
                              }
                            >
                              {user.company_name || 'No Company'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.username}</h3>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {user.role.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {user.company_name || 'No Company'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}
          </>
          )}
        </div>
      )}

      {/* Project Managers Tab */}
      {activeTab === 'project-managers' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Project Managers</h2>
              <button
                onClick={() => {
                  setCreateType('user')
                  setInitialRole('PROJECT_MANAGER')
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Project Manager</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search project managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">Loading project managers...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProjectManagers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {editingItem?.id === user.id && editingItem?.type === 'company' ? (
                              <select
                                value={editingItem.data.company_id || user.company || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, company_id: e.target.value },
                                  })
                                }
                                className="px-2 py-1 border rounded text-sm"
                                onBlur={() => {
                                  if (editingItem.data.company_id !== (user.company || '')) {
                                    handleAssignCompany(user.id, editingItem.data.company_id || null)
                                  } else {
                                    setEditingItem(null)
                                  }
                                }}
                                autoFocus
                              >
                                <option value="">No Company</option>
                                {companies?.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary-600"
                                onClick={() =>
                                  setEditingItem({
                                    id: user.id,
                                    type: 'company',
                                    data: { company_id: user.company || '' },
                                  })
                                }
                              >
                                {user.company_name || 'No Company'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredProjectManagers.map((user) => (
                  <div key={user.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-2 inline-block">
                          {user.company_name || 'No Company'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjectManagers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No project managers found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Workers</h2>
              <button
                onClick={() => {
                  setCreateType('user')
                  setInitialRole('WORKER')
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Worker</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">Loading workers...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredWorkers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {editingItem?.id === user.id && editingItem?.type === 'company' ? (
                              <select
                                value={editingItem.data.company_id || user.company || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, company_id: e.target.value },
                                  })
                                }
                                className="px-2 py-1 border rounded text-sm"
                                onBlur={() => {
                                  if (editingItem.data.company_id !== (user.company || '')) {
                                    handleAssignCompany(user.id, editingItem.data.company_id || null)
                                  } else {
                                    setEditingItem(null)
                                  }
                                }}
                                autoFocus
                              >
                                <option value="">No Company</option>
                                {companies?.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary-600"
                                onClick={() =>
                                  setEditingItem({
                                    id: user.id,
                                    type: 'company',
                                    data: { company_id: user.company || '' },
                                  })
                                }
                              >
                                {user.company_name || 'No Company'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredWorkers.map((user) => (
                  <div key={user.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-2 inline-block">
                          {user.company_name || 'No Company'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredWorkers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No workers found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Consultants Tab */}
      {activeTab === 'consultants' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Consultants</h2>
              <button
                onClick={() => {
                  setCreateType('user')
                  setInitialRole('CONSULTANT')
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Consultant</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search consultants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">Loading consultants...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredConsultants.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {editingItem?.id === user.id && editingItem?.type === 'company' ? (
                              <select
                                value={editingItem.data.company_id || user.company || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, company_id: e.target.value },
                                  })
                                }
                                className="px-2 py-1 border rounded text-sm"
                                onBlur={() => {
                                  if (editingItem.data.company_id !== (user.company || '')) {
                                    handleAssignCompany(user.id, editingItem.data.company_id || null)
                                  } else {
                                    setEditingItem(null)
                                  }
                                }}
                                autoFocus
                              >
                                <option value="">No Company</option>
                                {companies?.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary-600"
                                onClick={() =>
                                  setEditingItem({
                                    id: user.id,
                                    type: 'company',
                                    data: { company_id: user.company || '' },
                                  })
                                }
                              >
                                {user.company_name || 'No Company'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredConsultants.map((user) => (
                  <div key={user.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-2 inline-block">
                          {user.company_name || 'No Company'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredConsultants.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No consultants found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Document Controllers Tab */}
      {activeTab === 'document-controllers' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Document Controllers</h2>
              <button
                onClick={() => {
                  setCreateType('user')
                  setInitialRole('DOCUMENT_CONTROLLER')
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Document Controller</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search document controllers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">Loading document controllers...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocumentControllers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {editingItem?.id === user.id && editingItem?.type === 'company' ? (
                              <select
                                value={editingItem.data.company_id || user.company || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, company_id: e.target.value },
                                  })
                                }
                                className="px-2 py-1 border rounded text-sm"
                                onBlur={() => {
                                  if (editingItem.data.company_id !== (user.company || '')) {
                                    handleAssignCompany(user.id, editingItem.data.company_id || null)
                                  } else {
                                    setEditingItem(null)
                                  }
                                }}
                                autoFocus
                              >
                                <option value="">No Company</option>
                                {companies?.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary-600"
                                onClick={() =>
                                  setEditingItem({
                                    id: user.id,
                                    type: 'company',
                                    data: { company_id: user.company || '' },
                                  })
                                }
                              >
                                {user.company_name || 'No Company'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredDocumentControllers.map((user) => (
                  <div key={user.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-2 inline-block">
                          {user.company_name || 'No Company'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocumentControllers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No document controllers found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Contractors Tab */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">All Contractors</h2>
              <button
                onClick={() => {
                  setCreateType('contractor')
                  setInitialRole(null)
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Contractor</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {contractorsLoading ? (
            <div className="text-center py-12">Loading contractors...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredContractors.map((contractor) => (
                        <tr key={contractor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{contractor.name}</td>
                          <td className="px-6 py-4 text-gray-600">{contractor.email}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {contractor.company_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                contractor.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {contractor.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditContractor(contractor)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteContractor(contractor.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredContractors.map((contractor) => (
                  <div key={contractor.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{contractor.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{contractor.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {contractor.company_name || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          contractor.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contractor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditContractor(contractor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContractor(contractor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredContractors.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No contractors found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">All Departments</h2>
              <button
                onClick={() => {
                  setCreateType('department')
                  setInitialRole(null)
                  setShowCreateModal(true)
                }}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Department</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {departmentsLoading ? (
            <div className="text-center py-12">Loading departments...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contractor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDepartments.map((department) => (
                        <tr key={department.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{department.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{department.contractor_name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{department.company_name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{department.member_count || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                department.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {department.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAssignWorkers(department)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                                title="Assign Workers"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditDepartment(department)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(department.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredDepartments.map((department) => (
                  <div key={department.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{department.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{department.contractor_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500 mt-1">{department.company_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500 mt-1">{department.member_count || 0} members</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          department.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {department.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleAssignWorkers(department)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                        title="Assign Workers"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDepartments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No departments found
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles-permissions' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Roles & Permissions Management</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage system roles and their permissions</p>
            </div>
          </div>

          {rolesPermissionsLoading ? (
            <div className="text-center py-12">Loading roles and permissions...</div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Roles Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rolesPermissions?.roles?.map((role) => {
                  const roleInfo = rolesPermissions?.permissions?.[role.value] || rolesPermissions?.permissions?.[`${role.value}`]
                  return (
                    <div key={role.value} className="card p-4 sm:p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                            {roleInfo?.name || role.label}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{role.value}</p>
                        </div>
                      </div>
                      {roleInfo?.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{roleInfo.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Total Permissions</span>
                          <span className="font-semibold">
                            {roleInfo?.permissions ? Object.values(roleInfo.permissions).flat().length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Categories</span>
                          <span className="font-semibold">
                            {roleInfo?.permissions ? Object.keys(roleInfo.permissions).length : 0}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditPermissions(role.value)}
                        className="mt-3 w-full px-3 py-2 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Edit Permissions</span>
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Edit Permissions Modal/Section */}
              {editingPermissions && (
                <div className="card p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Edit Permissions: {rolesPermissions?.permissions?.[editingPermissions]?.name || editingPermissions}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {rolesPermissions?.permissions?.[editingPermissions]?.description || ''}
                      </p>
                    </div>
                    <button
                      onClick={handleCancelEditPermissions}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {rolesPermissions?.permission_categories?.map((category) => {
                      const currentPerms = localPermissions[editingPermissions]?.[category] || []
                      const allActions = rolesPermissions?.permission_actions || []
                      const allSelected = allActions.length > 0 && allActions.every(action => currentPerms.includes(action))
                      const someSelected = currentPerms.length > 0 && currentPerms.length < allActions.length
                      
                      return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
                              {category.replace('_', ' ')}
                            </h4>
                            <span className="text-xs text-gray-500">
                              ({currentPerms.length}/{allActions.length})
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectAllCategory(editingPermissions, category)}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title={allSelected ? "Deselect All" : "Select All"}
                          >
                            {allSelected ? (
                              <>
                                <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Deselect All</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Select All</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                          {rolesPermissions?.permission_actions?.map((action) => {
                            const currentPerms = localPermissions[editingPermissions]?.[category] || []
                            const isChecked = Array.isArray(currentPerms) && currentPerms.includes(action)
                            return (
                              <div
                                key={`${category}-${action}`}
                                className="flex items-center space-x-2 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  id={`perm-${category}-${action}`}
                                  checked={isChecked}
                                  onChange={() => {
                                    handleTogglePermission(editingPermissions, category, action)
                                  }}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                                />
                                <label
                                  htmlFor={`perm-${category}-${action}`}
                                  className="text-xs sm:text-sm text-gray-700 capitalize cursor-pointer flex-1"
                                >
                                  {action.replace('_', ' ')}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleResetPermissions(editingPermissions)}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={resetPermissionsMutation.isLoading}
                    >
                      {resetPermissionsMutation.isLoading ? 'Resetting...' : 'Reset to Defaults'}
                    </button>
                    <button
                      onClick={handleCancelEditPermissions}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePermissions(editingPermissions)}
                      className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                      disabled={updatePermissionsMutation.isLoading}
                    >
                      {updatePermissionsMutation.isLoading ? 'Saving...' : 'Save Permissions'}
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed Permissions Table - Desktop */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detailed Permissions Matrix</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">View all permissions for each role</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                          Permission Category
                        </th>
                        {rolesPermissions?.roles?.map((role) => (
                          <th key={role.value} className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-xs">{role.label}</span>
                              <span className="text-xs text-gray-400 mt-1">{role.value}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rolesPermissions?.permission_categories?.map((category) => (
                        <tr key={category} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 font-medium text-sm sticky left-0 bg-white z-10">
                            <div className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="capitalize">{category.replace('_', ' ')}</span>
                            </div>
                          </td>
                          {rolesPermissions?.roles?.map((role) => {
                            const roleInfo = rolesPermissions?.permissions?.[role.value] || rolesPermissions?.permissions?.[`${role.value}`]
                            // Use local permissions if editing, otherwise use original
                            const displayPerms = editingPermissions === role.value 
                              ? (localPermissions[role.value]?.[category] || [])
                              : (roleInfo?.permissions?.[category] || [])
                            return (
                              <td key={role.value} className="px-4 sm:px-6 py-4 text-center">
                                {displayPerms.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {displayPerms.map((perm) => (
                                      <span
                                        key={perm}
                                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                      >
                                        {perm}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">No access</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View for Permissions */}
              <div className="lg:hidden space-y-4">
                {rolesPermissions?.permission_categories?.map((category) => (
                  <div key={category} className="card p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-sm text-gray-900 capitalize">{category.replace('_', ' ')}</h3>
                    </div>
                    <div className="space-y-3">
                      {rolesPermissions?.roles?.map((role) => {
                        const roleInfo = rolesPermissions?.permissions?.[role.value] || rolesPermissions?.permissions?.[`${role.value}`]
                        const categoryPerms = roleInfo?.permissions?.[category] || []
                        return (
                          <div key={role.value} className="border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{role.label}</span>
                              <span className="text-xs text-gray-500">{categoryPerms.length} permissions</span>
                            </div>
                            {categoryPerms.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {categoryPerms.map((perm) => (
                                  <span
                                    key={perm}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                  >
                                    {perm}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No access</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Permission Actions Reference */}
              <div className="card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Permission Actions Reference</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                  {rolesPermissions?.permission_actions?.map((action) => (
                    <div
                      key={action}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <Unlock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-700 capitalize">{action.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          type={createType}
          initialRole={initialRole}
          onClose={() => {
            setShowCreateModal(false)
            setCreateType(null)
            setInitialRole(null)
          }}
          onCreateCompany={createCompanyMutation.mutate}
          onCreateUser={createUserMutation.mutate}
          onCreateContractor={createContractorMutation.mutate}
          onCreateDepartment={createDepartmentMutation.mutate}
          companies={companies}
          contractors={contractors}
          isLoading={createCompanyMutation.isLoading || createUserMutation.isLoading || createContractorMutation.isLoading || createDepartmentMutation.isLoading}
        />
      )}

      {/* Assign Workers Modal */}
      {showEditModal && editType === 'assign-workers' && editData && (
        <AssignWorkersModal
          department={editData}
          workers={users}
          onClose={() => {
            setShowEditModal(false)
            setEditType(null)
            setEditData(null)
          }}
          onAssign={assignWorkersMutation.mutate}
          isLoading={assignWorkersMutation.isLoading}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editType !== 'assign-workers' && editData && (
        <EditModal
          type={editType}
          data={editData}
          onClose={() => {
            setShowEditModal(false)
            setEditType(null)
            setEditData(null)
          }}
          onUpdateCompany={updateCompanyMutation.mutate}
          onUpdateUser={updateUserMutation.mutate}
          onUpdateContractor={updateContractorMutation.mutate}
          companies={companies}
          isLoading={updateCompanyMutation.isLoading || updateUserMutation.isLoading || updateContractorMutation.isLoading}
        />
      )}
    </div>
  )
}