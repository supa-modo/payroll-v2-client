import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiUpload,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";
import { TbId } from "react-icons/tb";
import { TbCheck } from "react-icons/tb";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import DateInput from "../../components/ui/DateInput";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import BankDetailsSection from "../../components/employees/BankDetailsSection";
import DocumentManager from "../../components/employees/DocumentManager";
import api from "../../services/api";
import type { Employee, CreateEmployeeInput } from "../../types/employee";
import type { Department } from "../../types/department";
import type { Role } from "../../types/role";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess?: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateEmployeeInput>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    personalEmail: "",
    workEmail: "",
    phonePrimary: "",
    phoneSecondary: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    postalCode: "",
    country: "Kenya",
    nationalId: "",
    passportNumber: "",
    kraPin: "",
    nssfNumber: "",
    nhifNumber: "",
    departmentId: "",
    jobTitle: "",
    jobGrade: "",
    employmentType: "permanent",
    hireDate: new Date().toISOString().split("T")[0],
    probationEndDate: "",
    contractEndDate: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    createUserAccount: false,
    roleId: "",
    userPassword: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchRoles();
      if (employee) {
        // Helper to format date to YYYY-MM-DD
        const formatDate = (date: string | undefined | null): string => {
          if (!date) return "";
          try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split("T")[0];
          } catch {
            return "";
          }
        };

        setFormData({
          employeeNumber: employee.employeeNumber,
          firstName: employee.firstName,
          lastName: employee.lastName,
          middleName: employee.middleName || "",
          dateOfBirth: formatDate(employee.dateOfBirth),
          gender: employee.gender || "",
          maritalStatus: employee.maritalStatus || "",
          nationality: employee.nationality || "",
          personalEmail: employee.personalEmail || "",
          workEmail: employee.workEmail || "",
          phonePrimary: employee.phonePrimary || "",
          phoneSecondary: employee.phoneSecondary || "",
          addressLine1: employee.addressLine1 || "",
          addressLine2: employee.addressLine2 || "",
          city: employee.city || "",
          county: employee.county || "",
          postalCode: employee.postalCode || "",
          country: employee.country || "Kenya",
          nationalId: employee.nationalId || "",
          passportNumber: employee.passportNumber || "",
          kraPin: employee.kraPin || "",
          nssfNumber: employee.nssfNumber || "",
          nhifNumber: employee.nhifNumber || "",
          departmentId: employee.departmentId || "",
          jobTitle: employee.jobTitle,
          jobGrade: employee.jobGrade || "",
          employmentType: employee.employmentType,
          hireDate: formatDate(employee.hireDate),
          probationEndDate: formatDate(employee.probationEndDate),
          contractEndDate: formatDate(employee.contractEndDate),
          emergencyContactName: employee.emergencyContactName || "",
          emergencyContactPhone: employee.emergencyContactPhone || "",
          emergencyContactRelationship:
            employee.emergencyContactRelationship || "",
        });
        setPhotoPreview(employee.photoUrl || null);
        setCurrentEmployeeId(employee.id);
      } else {
        // Reset form for new employee
        setFormData({
          firstName: "",
          lastName: "",
          middleName: "",
          dateOfBirth: "",
          gender: "",
          maritalStatus: "",
          nationality: "",
          personalEmail: "",
          workEmail: "",
          phonePrimary: "",
          phoneSecondary: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          county: "",
          postalCode: "",
          country: "Kenya",
          nationalId: "",
          passportNumber: "",
          kraPin: "",
          nssfNumber: "",
          nhifNumber: "",
          departmentId: "",
          jobTitle: "",
          jobGrade: "",
          employmentType: "permanent",
          hireDate: new Date().toISOString().split("T")[0],
          probationEndDate: "",
          contractEndDate: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelationship: "",
          createUserAccount: false,
          roleId: "",
          userPassword: "",
        });
        setPhotoPreview(null);
        setCurrentEmployeeId(null);
      }
      setErrors({});
      setSubmitError("");
      setSubmitSuccess(false);
    }
  }, [isOpen, employee]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.workEmail?.trim() && !formData.personalEmail?.trim()) {
      newErrors.workEmail = "Work email or personal email is required";
    }
    if (
      formData.workEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)
    ) {
      newErrors.workEmail = "Invalid email format";
    }
    if (
      formData.personalEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)
    ) {
      newErrors.personalEmail = "Invalid email format";
    }
    if (!formData.phonePrimary?.trim()) {
      newErrors.phonePrimary = "Primary phone is required";
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }
    if (!formData.hireDate) {
      newErrors.hireDate = "Hire date is required";
    }

    // Validate user account creation fields if enabled
    if (formData.createUserAccount) {
      if (!formData.workEmail?.trim() && !formData.personalEmail?.trim()) {
        newErrors.workEmail = "Email is required to create user account";
      }
      if (!formData.roleId) {
        newErrors.roleId = "Role is required to create user account";
      }
      if (!formData.userPassword || formData.userPassword.length < 8) {
        newErrors.userPassword = "Password must be at least 8 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (employee) {
        // Update existing employee
        await api.put(`/employees/${employee.id}`, formData);
        setSubmitSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        // Create new employee
        const response = await api.post("/employees", formData);
        // Set the newly created employee ID so bank details and documents sections can be shown
        if (response.data?.employee?.id) {
          setCurrentEmployeeId(response.data.employee.id);
          // Fetch the full employee details to populate the form
          try {
            const employeeResponse = await api.get(`/employees/${response.data.employee.id}`);
            if (employeeResponse.data?.employee) {
              // Update the form to show we're now editing
              // The useEffect will handle updating the form when employee changes
              // For now, just set the employee ID and let the user add bank details/docs
              // Refresh the employee list but keep modal open
              onSuccess?.();
            }
          } catch (fetchError) {
            console.error("Failed to fetch created employee:", fetchError);
            // Still set the ID so sections can show
          }
        } else {
          setSubmitSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to save employee. Please try again.";
      setSubmitError(errorMessage);

      // If there are field-specific errors, set them
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.param) {
            fieldErrors[err.param] = err.msg || err.message;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <TbCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Employee {employee ? "Updated" : "Created"} Successfully!
          </h2>
          <p className="text-gray-600">
            The employee has been {employee ? "updated" : "created"}{" "}
            successfully.
          </p>
        </div>
      </Modal>
    );
  }

  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "", label: "Select marital status" },
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  const employmentTypeOptions = [
    { value: "permanent", label: "Permanent" },
    { value: "contract", label: "Contract" },
    { value: "casual", label: "Casual" },
    { value: "intern", label: "Intern" },
  ];

  const departmentOptions = [
    { value: "", label: "Select department" },
    ...departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Employee" : "New Employee"}
      size="xl"
      closeOnBackdropClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5 flex items-start gap-3">
            <FiAlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {currentEmployeeId && !employee && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-md px-4 py-2.5 flex items-start gap-3">
            <TbCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 text-sm font-medium">Employee created successfully!</p>
              <p className="text-green-600 text-xs mt-1">
                You can now add bank details and upload documents below.
              </p>
            </div>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
          {/* Section 1: Personal Information */}
          <div>
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                error={errors.firstName}
              />
              <Input
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                error={errors.middleName}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                error={errors.lastName}
              />
              <DateInput
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange(e as any)}
                error={errors.dateOfBirth}
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => handleSelectChange("gender")(e.target.value)}
                options={genderOptions}
                error={errors.gender}
              />
              <Select
                label="Marital Status"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) =>
                  handleSelectChange("maritalStatus")(e.target.value)
                }
                options={maritalStatusOptions}
                error={errors.maritalStatus}
              />
              <Input
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                error={errors.nationality}
              />
              <div className="w-full mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <FiUpload className="w-4 h-4" />
                      <span className="text-sm">Upload Photo</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <FiMail className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Personal Email"
                name="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={handleInputChange}
                error={errors.personalEmail}
              />
              <Input
                label="Work Email"
                name="workEmail"
                type="email"
                value={formData.workEmail}
                onChange={handleInputChange}
                required={!formData.personalEmail}
                error={errors.workEmail}
              />
              <Input
                label="Primary Phone"
                name="phonePrimary"
                type="tel"
                value={formData.phonePrimary}
                onChange={handleInputChange}
                required
                error={errors.phonePrimary}
              />
              <Input
                label="Secondary Phone"
                name="phoneSecondary"
                type="tel"
                value={formData.phoneSecondary}
                onChange={handleInputChange}
                error={errors.phoneSecondary}
              />
            </div>
          </div>

          {/* Section 3: Address Information */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                error={errors.addressLine1}
              />
              <Input
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                error={errors.addressLine2}
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
              />
              <Input
                label="County"
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                error={errors.county}
              />
              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                error={errors.postalCode}
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                error={errors.country}
              />
            </div>
          </div>

          {/* Section 4: Identification */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <TbId className="w-5 h-5" />
              Identification (Kenya-specific)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="National ID"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                error={errors.nationalId}
              />
              <Input
                label="Passport Number"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                error={errors.passportNumber}
              />
              <Input
                label="KRA PIN"
                name="kraPin"
                value={formData.kraPin}
                onChange={handleInputChange}
                error={errors.kraPin}
              />
              <Input
                label="NSSF Number"
                name="nssfNumber"
                value={formData.nssfNumber}
                onChange={handleInputChange}
                error={errors.nssfNumber}
              />
              <Input
                label="NHIF Number"
                name="nhifNumber"
                value={formData.nhifNumber}
                onChange={handleInputChange}
                error={errors.nhifNumber}
              />
            </div>
          </div>

          {/* Section 5: Employment Details */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" />
              Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee && (
                <Input
                  label="Employee Number"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  disabled
                  error={errors.employeeNumber}
                />
              )}
              <Input
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                error={errors.jobTitle}
              />
              <Input
                label="Job Grade"
                name="jobGrade"
                value={formData.jobGrade}
                onChange={handleInputChange}
                error={errors.jobGrade}
              />
              <Select
                label="Department"
                name="departmentId"
                value={formData.departmentId}
                onChange={(e) =>
                  handleSelectChange("departmentId")(e.target.value)
                }
                options={departmentOptions}
                error={errors.departmentId}
              />
              <Select
                label="Employment Type"
                name="employmentType"
                value={formData.employmentType}
                onChange={(e) =>
                  handleSelectChange("employmentType")(e.target.value)
                }
                options={employmentTypeOptions}
                required
                error={errors.employmentType}
              />
              <DateInput
                label="Hire Date"
                name="hireDate"
                value={formData.hireDate}
                onChange={(e) => handleInputChange(e as any)}
                required
                error={errors.hireDate}
              />
              <DateInput
                label="Probation End Date"
                name="probationEndDate"
                value={formData.probationEndDate}
                onChange={(e) => handleInputChange(e as any)}
                error={errors.probationEndDate}
              />
              {formData.employmentType === "contract" && (
                <DateInput
                  label="Contract End Date"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={(e) => handleInputChange(e as any)}
                  error={errors.contractEndDate}
                />
              )}
            </div>
          </div>

          {/* Section 6: Emergency Contact */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                error={errors.emergencyContactName}
              />
              <Input
                label="Contact Phone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                error={errors.emergencyContactPhone}
              />
              <Input
                label="Relationship"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleInputChange}
                error={errors.emergencyContactRelationship}
              />
            </div>
          </div>

          {/* Section 7: User Account & Role Assignment */}
          {!employee && (
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="font-semibold text-secondary-600 mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5" />
                User Account & Role Assignment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createUserAccount"
                    checked={formData.createUserAccount}
                    onChange={(e) =>
                      setFormData({ ...formData, createUserAccount: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="createUserAccount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Create user account for this employee
                  </label>
                </div>

                {formData.createUserAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary-200">
                    <Select
                      label="Role"
                      name="roleId"
                      value={formData.roleId}
                      onChange={(e) =>
                        handleSelectChange("roleId")(e.target.value)
                      }
                      options={[
                        { value: "", label: "Select a role" },
                        ...roles.map((role) => ({
                          value: role.id,
                          label: role.displayName,
                        })),
                      ]}
                      required={formData.createUserAccount}
                      error={errors.roleId}
                    />
                    <Input
                      label="Password"
                      name="userPassword"
                      type="password"
                      value={formData.userPassword}
                      onChange={handleInputChange}
                      required={formData.createUserAccount}
                      minLength={8}
                      error={errors.userPassword}
                      placeholder="Minimum 8 characters"
                    />
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">
                        The user account will be created using the work email. The employee
                        will be able to log in and access the system based on the assigned role.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 8: Bank Details - Only show for existing employees */}
          {(currentEmployeeId || employee?.id) && (
            <div className="border-t-2 border-gray-200 pt-6">
              <BankDetailsSection employeeId={currentEmployeeId || employee!.id} />
            </div>
          )}

          {/* Section 9: Documents - Only show for existing employees */}
          {(currentEmployeeId || employee?.id) && (
            <div className="border-t-2 border-gray-200 pt-6">
              <DocumentManager employeeId={currentEmployeeId || employee!.id} />
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {currentEmployeeId && !employee ? "Done" : "Cancel"}
          </Button>
          {!currentEmployeeId && (
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {employee ? "Update Employee" : "Create Employee"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
