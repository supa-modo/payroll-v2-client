import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";
import { TbId as TbIdIcon } from "react-icons/tb";
import Button from "../../components/ui/Button";
import BankDetailsSection from "../../components/employees/BankDetailsSection";
import DocumentManager from "../../components/employees/DocumentManager";
import api from "../../services/api";
import type { Employee } from "../../types/employee";

const EmployeeDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${employeeId}`);
      setEmployee(response.data.employee);
    } catch (error: any) {
      console.error("Failed to fetch employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeId) return;
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      navigate("/employees");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete employee");
    }
  };

  const getPhotoUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    // If it's already a full URL, return as is
    if (photoUrl.startsWith("http")) return photoUrl;
    // Otherwise, construct the full URL
    const baseURL = api.defaults.baseURL?.replace("/api", "") || "";
    return `${baseURL}/uploads/${photoUrl}`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Employee not found</p>
          <Button onClick={() => navigate("/employees")} variant="outline">
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(employee.photoUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/employees")}
            variant="outline"
            leftIcon={<FiArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(`/employees/${employeeId}/salary`)}
            variant="outline"
            leftIcon={<FiDollarSign className="w-4 h-4" />}
          >
            View Salary
          </Button>
          <Button
            onClick={() => navigate(`/employees?edit=${employeeId}`)}
            variant="primary"
            leftIcon={<FiEdit2 className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            leftIcon={<FiTrash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Employee Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement("div");
                    fallback.className = "w-32 h-32 rounded-full border-4 border-gray-200 bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-4xl";
                    fallback.textContent = getInitials(employee.firstName, employee.lastName);
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-4xl">
                {getInitials(employee.firstName, employee.lastName)}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {employee.firstName} {employee.middleName} {employee.lastName}
            </h2>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <span className="font-medium">{employee.employeeNumber}</span>
              <span className="text-gray-400">•</span>
              <span>{employee.jobTitle}</span>
              {employee.department && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{employee.department.name}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {employee.workEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span>{employee.workEmail}</span>
                </div>
              )}
              {employee.phonePrimary && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span>{employee.phonePrimary}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-800"
                      : employee.status === "probation"
                      ? "bg-yellow-100 text-yellow-800"
                      : employee.status === "terminated" || employee.status === "resigned"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary-600" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth</span>
              <span className="font-medium">{formatDate(employee.dateOfBirth)}</span>
            </div>
            {employee.gender && (
              <div className="flex justify-between">
                <span className="text-gray-600">Gender</span>
                <span className="font-medium">{employee.gender}</span>
              </div>
            )}
            {employee.maritalStatus && (
              <div className="flex justify-between">
                <span className="text-gray-600">Marital Status</span>
                <span className="font-medium">{employee.maritalStatus}</span>
              </div>
            )}
            {employee.nationality && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nationality</span>
                <span className="font-medium">{employee.nationality}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiMail className="w-5 h-5 text-primary-600" />
            Contact Information
          </h3>
          <div className="space-y-3">
            {employee.workEmail && (
              <div className="flex justify-between">
                <span className="text-gray-600">Work Email</span>
                <span className="font-medium">{employee.workEmail}</span>
              </div>
            )}
            {employee.personalEmail && (
              <div className="flex justify-between">
                <span className="text-gray-600">Personal Email</span>
                <span className="font-medium">{employee.personalEmail}</span>
              </div>
            )}
            {employee.phonePrimary && (
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Phone</span>
                <span className="font-medium">{employee.phonePrimary}</span>
              </div>
            )}
            {employee.phoneSecondary && (
              <div className="flex justify-between">
                <span className="text-gray-600">Secondary Phone</span>
                <span className="font-medium">{employee.phoneSecondary}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        {(employee.addressLine1 || employee.city || employee.county) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-primary-600" />
              Address
            </h3>
            <div className="space-y-2 text-sm">
              {employee.addressLine1 && <p className="font-medium">{employee.addressLine1}</p>}
              {employee.addressLine2 && <p className="text-gray-600">{employee.addressLine2}</p>}
              <p className="text-gray-600">
                {[employee.city, employee.county, employee.postalCode, employee.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Employment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiBriefcase className="w-5 h-5 text-primary-600" />
            Employment Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Employment Type</span>
              <span className="font-medium capitalize">{employee.employmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hire Date</span>
              <span className="font-medium">{formatDate(employee.hireDate)}</span>
            </div>
            {employee.probationEndDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Probation End Date</span>
                <span className="font-medium">{formatDate(employee.probationEndDate)}</span>
              </div>
            )}
            {employee.contractEndDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contract End Date</span>
                <span className="font-medium">{formatDate(employee.contractEndDate)}</span>
              </div>
            )}
            {employee.jobGrade && (
              <div className="flex justify-between">
                <span className="text-gray-600">Job Grade</span>
                <span className="font-medium">{employee.jobGrade}</span>
              </div>
            )}
          </div>
        </div>

        {/* Identification */}
        {(employee.nationalId || employee.passportNumber || employee.kraPin || employee.nssfNumber || employee.nhifNumber) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TbIdIcon className="w-5 h-5 text-primary-600" />
              Identification
            </h3>
            <div className="space-y-3">
              {employee.nationalId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">National ID</span>
                  <span className="font-medium">{employee.nationalId}</span>
                </div>
              )}
              {employee.passportNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Passport Number</span>
                  <span className="font-medium">{employee.passportNumber}</span>
                </div>
              )}
              {employee.kraPin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">KRA PIN</span>
                  <span className="font-medium">{employee.kraPin}</span>
                </div>
              )}
              {employee.nssfNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">NSSF Number</span>
                  <span className="font-medium">{employee.nssfNumber}</span>
                </div>
              )}
              {employee.nhifNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">NHIF Number</span>
                  <span className="font-medium">{employee.nhifNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {(employee.emergencyContactName || employee.emergencyContactPhone) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-primary-600" />
              Emergency Contact
            </h3>
            <div className="space-y-3">
              {employee.emergencyContactName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Name</span>
                  <span className="font-medium">{employee.emergencyContactName}</span>
                </div>
              )}
              {employee.emergencyContactPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Phone</span>
                  <span className="font-medium">{employee.emergencyContactPhone}</span>
                </div>
              )}
              {employee.emergencyContactRelationship && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Relationship</span>
                  <span className="font-medium">{employee.emergencyContactRelationship}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bank Details Section */}
      {employeeId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-primary-600" />
            Bank Details
          </h3>
          <BankDetailsSection employeeId={employeeId} />
        </div>
      )}

      {/* Documents Section */}
      {employeeId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-primary-600" />
            Documents
          </h3>
          <DocumentManager employeeId={employeeId} />
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;

