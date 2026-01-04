import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiArrowRight, FiArrowLeft, FiUsers, FiBriefcase, FiDollarSign } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import api from "../../services/api";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Let's set up your payroll system",
    icon: FiCheck,
  },
  {
    id: "departments",
    title: "Departments",
    description: "Create your organizational structure",
    icon: FiBriefcase,
  },
  {
    id: "employees",
    title: "Employees",
    description: "Add your first employees",
    icon: FiUsers,
  },
  {
    id: "salary",
    title: "Salary Components",
    description: "Configure salary structure",
    icon: FiDollarSign,
  },
  {
    id: "complete",
    title: "Complete",
    description: "You're all set!",
    icon: FiCheck,
  },
];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Department form data
  const [departments, setDepartments] = useState<Array<{ name: string; code: string }>>([
    { name: "", code: "" },
  ]);

  // Employee form data
  const [employees, setEmployees] = useState<Array<{
    firstName: string;
    lastName: string;
    workEmail: string;
    jobTitle: string;
    departmentId: string;
    phonePrimary: string;
  }>>([
    {
      firstName: "",
      lastName: "",
      workEmail: "",
      jobTitle: "",
      departmentId: "",
      phonePrimary: "",
    },
  ]);

  // Salary component form data
  const [salaryComponents, setSalaryComponents] = useState<Array<{
    name: string;
    type: string;
    isTaxable: boolean;
    isStatutory: boolean;
  }>>([
    { name: "Basic Salary", type: "earning", isTaxable: true, isStatutory: false },
    { name: "PAYE", type: "deduction", isTaxable: false, isStatutory: true },
    { name: "NSSF", type: "deduction", isTaxable: false, isStatutory: true },
    { name: "NHIF", type: "deduction", isTaxable: false, isStatutory: true },
  ]);

  const [createdDepartmentIds, setCreatedDepartmentIds] = useState<string[]>([]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      navigate("/dashboard");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (steps[currentStep].id === "departments") {
        // Create departments
        const departmentIds: string[] = [];
        for (const dept of departments) {
          if (dept.name.trim()) {
            const response = await api.post("/departments", {
              name: dept.name.trim(),
              code: dept.code.trim() || undefined,
            });
            departmentIds.push(response.data.department.id);
          }
        }
        setCreatedDepartmentIds(departmentIds);
      } else if (steps[currentStep].id === "employees") {
        // Create employees
        for (const emp of employees) {
          if (emp.firstName.trim() && emp.lastName.trim() && emp.workEmail.trim()) {
            await api.post("/employees", {
              ...emp,
              departmentId: emp.departmentId || undefined,
              hireDate: new Date().toISOString().split("T")[0],
              employmentType: "permanent",
            });
          }
        }
      } else if (steps[currentStep].id === "salary") {
        // Create salary components
        for (const component of salaryComponents) {
          if (component.name.trim()) {
            await api.post("/salary-components", {
              name: component.name.trim(),
              type: component.type,
              isTaxable: component.isTaxable,
              isStatutory: component.isStatutory,
            });
          }
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      navigate("/dashboard");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const addDepartment = () => {
    setDepartments([...departments, { name: "", code: "" }]);
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };

  const addEmployee = () => {
    setEmployees([
      ...employees,
      {
        firstName: "",
        lastName: "",
        workEmail: "",
        jobTitle: "",
        departmentId: "",
        phonePrimary: "",
      },
    ]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index: number, field: string, value: string) => {
    const updated = [...employees];
    updated[index] = { ...updated[index], [field]: value };
    setEmployees(updated);
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Payroll System!
              </h2>
              <p className="text-gray-600">
                Let's get you started by setting up the basics. This will only take a few minutes.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>What we'll set up:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc list-inside">
                <li>Your organizational departments</li>
                <li>Your first employees</li>
                <li>Basic salary components</li>
              </ul>
            </div>
          </div>
        );

      case "departments":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Departments
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your organizational departments. You can add more later.
              </p>
            </div>
            {departments.map((dept, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border border-gray-200 rounded-lg"
              >
                <Input
                  label="Department Name"
                  value={dept.name}
                  onChange={(e) => updateDepartment(index, "name", e.target.value)}
                  placeholder="e.g., Human Resources"
                />
                <Input
                  label="Code (Optional)"
                  value={dept.code}
                  onChange={(e) => updateDepartment(index, "code", e.target.value)}
                  placeholder="e.g., HR"
                />
                <div className="flex gap-2">
                  {departments.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeDepartment(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDepartment}>
              + Add Another Department
            </Button>
          </div>
        );

      case "employees":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add Employees
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your first employees. You can add more later from the Employees page.
              </p>
            </div>
            {employees.map((emp, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <Input
                  label="First Name"
                  value={emp.firstName}
                  onChange={(e) => updateEmployee(index, "firstName", e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={emp.lastName}
                  onChange={(e) => updateEmployee(index, "lastName", e.target.value)}
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  value={emp.workEmail}
                  onChange={(e) => updateEmployee(index, "workEmail", e.target.value)}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={emp.phonePrimary}
                  onChange={(e) => updateEmployee(index, "phonePrimary", e.target.value)}
                  required
                />
                <Input
                  label="Job Title"
                  value={emp.jobTitle}
                  onChange={(e) => updateEmployee(index, "jobTitle", e.target.value)}
                  required
                />
                <Select
                  label="Department"
                  value={emp.departmentId}
                  onChange={(e) => updateEmployee(index, "departmentId", e.target.value)}
                  options={[
                    { value: "", label: "Select department" },
                    ...createdDepartmentIds.map((id, idx) => ({
                      value: id,
                      label: departments[idx]?.name || `Department ${idx + 1}`,
                    })),
                  ]}
                />
                {employees.length > 1 && (
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeEmployee(index)}
                    >
                      Remove Employee
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEmployee}>
              + Add Another Employee
            </Button>
          </div>
        );

      case "salary":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Salary Components
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure basic salary components. These are pre-filled with common components.
              </p>
            </div>
            <div className="space-y-3">
              {salaryComponents.map((component, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <Input
                    label="Component Name"
                    value={component.name}
                    onChange={(e) => {
                      const updated = [...salaryComponents];
                      updated[index].name = e.target.value;
                      setSalaryComponents(updated);
                    }}
                    required
                  />
                  <Select
                    label="Type"
                    value={component.type}
                    onChange={(e) => {
                      const updated = [...salaryComponents];
                      updated[index].type = e.target.value;
                      setSalaryComponents(updated);
                    }}
                    options={[
                      { value: "earning", label: "Earning" },
                      { value: "deduction", label: "Deduction" },
                    ]}
                  />
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id={`taxable-${index}`}
                      checked={component.isTaxable}
                      onChange={(e) => {
                        const updated = [...salaryComponents];
                        updated[index].isTaxable = e.target.checked;
                        setSalaryComponents(updated);
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`taxable-${index}`} className="text-sm">
                      Taxable
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id={`statutory-${index}`}
                      checked={component.isStatutory}
                      onChange={(e) => {
                        const updated = [...salaryComponents];
                        updated[index].isStatutory = e.target.checked;
                        setSalaryComponents(updated);
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`statutory-${index}`} className="text-sm">
                      Statutory
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Setup Complete!
              </h2>
              <p className="text-gray-600">
                Your payroll system is ready to use. You can start processing payrolls and managing
                your employees.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <p className="font-semibold text-gray-900 mb-2">Next Steps:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Assign salaries to your employees</li>
                <li>• Create your first payroll period</li>
                <li>• Configure expense categories</li>
                <li>• Set up user roles and permissions</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "bg-primary-600 border-primary-600 text-white"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isActive ? "text-primary-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 min-h-[400px]">{renderStepContent()}</div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              isLoading={loading}
              rightIcon={currentStep === steps.length - 1 ? undefined : <FiArrowRight className="w-4 h-4" />}
            >
              {currentStep === steps.length - 1 ? "Go to Dashboard" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

