import React, { useState, useEffect } from "react";
import {
    FiX, FiCheck, FiArrowRight, FiUpload,
    FiPlus, FiTrash2, FiFile, FiCreditCard, FiAlertCircle, FiShield, FiLock,
    FiFileText, FiCamera,
} from "react-icons/fi";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import api from "../../services/api";
import type { Employee, CreateEmployeeInput, BankDetailInput, DocumentMetadataInput } from "../../types/employee";
import type { Department } from "../../types/department";
import type { Role } from "../../types/role";
import type { SalaryComponent } from "../../types/salary";
import { TbAlertTriangle, TbArrowBack, TbBriefcase, TbCheck, TbLockFilled, TbShieldHalfFilled } from "react-icons/tb";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { PiUserDuotone } from "react-icons/pi";

/* ─── steps ─────────────────────────────────────────────── */
const STEPS = [
    { id: 1, title: "Personal Info", desc: "Name, contact & address", icon: <PiUserDuotone className="w-5 h-5" />, optional: false },
    { id: 2, title: "Employment", desc: "Role, department & dates", icon: <TbBriefcase className="w-5 h-5" />, optional: false },
    { id: 3, title: "Identification", desc: "ID, KRA PIN & statutory IDs", icon: <TbShieldHalfFilled className="w-5 h-5" />, optional: true },
    { id: 4, title: "User Account", desc: "Login role & password", icon: <TbLockFilled className="w-5 h-5" />, optional: false },
    { id: 5, title: "Bank Details", desc: "Payment method for payroll", icon: <FiCreditCard className="w-5 h-5" />, optional: true },
    { id: 6, title: "Documents", desc: "Contracts, IDs & certificates", icon: <FiFileText className="w-5 h-5" />, optional: true },
    { id: 7, title: "Salary Setup", desc: "Basic salary, deductions & relief-ready defaults", icon: <FiShield className="w-5 h-5" />, optional: false },
];

/* ─── small helpers ──────────────────────────────────────── */
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h4 className="text-sm font-bold text-tertiary-600 mb-4 flex items-center gap-2">
            <span className="flex-1 h-px bg-slate-200" />
            {title}
            <span className="flex-1 h-px bg-slate-200" />
        </h4>
        {children}
    </div>
);

/** Server stores photo paths relative to uploads/; <img> needs an absolute URL. */
function employeePhotoSrc(photoUrl?: string | null): string | null {
    if (!photoUrl?.trim()) return null;
    const u = photoUrl.trim();
    if (u.startsWith("data:") || u.startsWith("blob:")) return u;
    if (/^https?:\/\//i.test(u)) return u;
    const origin = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
    if (u.startsWith("/")) return `${origin}${u}`;
    return `${origin}/uploads/${u.replace(/^\/+/, "")}`;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? "bg-primary-600" : "bg-slate-200"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
interface Props {
    employee?: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface EmployeeSalaryRow {
    salaryComponentId: string;
    amount: number;
    source: "manual" | "auto";
}

const EmployeeFormDrawer: React.FC<Props> = ({ employee, onClose, onSuccess }) => {
    const isEdit = !!employee;
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [bankDetails, setBankDetails] = useState<BankDetailInput[]>([]);
    const [documents, setDocuments] = useState<Array<{ file: File; metadata: DocumentMetadataInput }>>([]);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [salaryTemplates, setSalaryTemplates] = useState<SalaryComponent[]>([]);
    const [salaryRows, setSalaryRows] = useState<EmployeeSalaryRow[]>([]);
    const [selectedSalaryTemplate, setSelectedSalaryTemplate] = useState("");

    const fmtDate = (d?: string | null) => {
        if (!d) return "";
        try { return new Date(d).toISOString().split("T")[0]; } catch { return ""; }
    };

    const emptyForm: CreateEmployeeInput = {
        firstName: "", lastName: "", middleName: "", dateOfBirth: "", gender: "",
        maritalStatus: "", nationality: "", personalEmail: "", workEmail: "",
        phonePrimary: "", phoneSecondary: "", addressLine1: "", addressLine2: "",
        city: "", county: "", postalCode: "", country: "Kenya",
        nationalId: "", passportNumber: "", kraPin: "", nssfNumber: "", nhifNumber: "",
        departmentId: "", jobTitle: "", jobGrade: "", employmentType: "permanent",
        hireDate: new Date().toISOString().split("T")[0],
        probationEndDate: "", contractEndDate: "",
        emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
        roleId: "", userPassword: "",
    };

    const [form, setForm] = useState<CreateEmployeeInput>(emptyForm);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        fetchData();

        if (employee) {
            setForm({
                employeeNumber: employee.employeeNumber,
                firstName: employee.firstName, lastName: employee.lastName,
                middleName: employee.middleName || "",
                dateOfBirth: fmtDate(employee.dateOfBirth),
                gender: employee.gender || "", maritalStatus: employee.maritalStatus || "",
                nationality: employee.nationality || "",
                personalEmail: employee.personalEmail || "", workEmail: employee.workEmail || "",
                phonePrimary: employee.phonePrimary || "", phoneSecondary: employee.phoneSecondary || "",
                addressLine1: employee.addressLine1 || "", addressLine2: employee.addressLine2 || "",
                city: employee.city || "", county: employee.county || "",
                postalCode: employee.postalCode || "", country: employee.country || "Kenya",
                nationalId: employee.nationalId || "", passportNumber: employee.passportNumber || "",
                kraPin: employee.kraPin || "", nssfNumber: employee.nssfNumber || "",
                nhifNumber: employee.nhifNumber || "", departmentId: employee.departmentId || "",
                jobTitle: employee.jobTitle, jobGrade: employee.jobGrade || "",
                employmentType: employee.employmentType,
                hireDate: fmtDate(employee.hireDate),
                probationEndDate: fmtDate(employee.probationEndDate),
                contractEndDate: fmtDate(employee.contractEndDate),
                emergencyContactName: employee.emergencyContactName || "",
                emergencyContactPhone: employee.emergencyContactPhone || "",
                emergencyContactRelationship: employee.emergencyContactRelationship || "",
                roleId: "", userPassword: "",
            });
            setPhotoPreview(employeePhotoSrc(employee.photoUrl));
        }

        const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    useEffect(() => {
        if (employee?.id) {
            setPhotoFile(null);
            setPhotoPreview(employeePhotoSrc(employee.photoUrl));
        } else {
            setPhotoPreview(null);
            setPhotoFile(null);
        }
    }, [employee?.id, employee?.photoUrl]);

    const fetchData = async () => {
        try {
            const [dr, rr, sr] = await Promise.all([api.get("/departments"), api.get("/roles"), api.get("/salary-components")]);
            setDepartments(dr.data.departments || []);
            setRoles(rr.data.roles || []);
            setSalaryTemplates(sr.data.components || []);
        } catch { }
    };

    const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
    };

    const validate = (step: number) => {
        const e: Record<string, string> = {};
        if (step === 1) {
            if (!form.firstName.trim()) e.firstName = "First name is required";
            if (!form.lastName.trim()) e.lastName = "Last name is required";
            if (!form.workEmail?.trim()) e.workEmail = "Work email is required";
            else if (!/\S+@\S+\.\S+/.test(form.workEmail)) e.workEmail = "Invalid email format";
            if (!form.phonePrimary?.trim()) e.phonePrimary = "Primary phone is required";
        }
        if (step === 2) {
            if (!form.jobTitle.trim()) e.jobTitle = "Job title is required";
            if (!form.hireDate) e.hireDate = "Hire date is required";
        }
        if (step === 4 && !isEdit) {
            if (!form.roleId) e.roleId = "Please select a role";
            if (!form.userPassword || form.userPassword.length < 8) e.userPassword = "Minimum 8 characters required";
            if (confirmPassword !== form.userPassword) e.confirmPassword = "Passwords do not match";
        }
        if (step === 5) {
            bankDetails.forEach((bank, index) => {
                if (bank.paymentMethod === "bank") {
                    if (!bank.bankName?.trim()) e[`bankName_${index}`] = "Bank name is required";
                    if (!bank.accountNumber?.trim()) e[`accountNumber_${index}`] = "Account number is required";
                }
                if (bank.paymentMethod === "mpesa" && !bank.mpesaPhone?.trim()) {
                    e[`mpesaPhone_${index}`] = "M-Pesa phone is required";
                }
            });
        }
        if (step === 7 && !isEdit) {
            const basic = getBasicSalaryAmount();
            if (!basic || basic <= 0) {
                e.basicSalary = "Basic salary is required before salary setup can be completed";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const payeBands = [
        { min: 0, max: 24000, rate: 10 },
        { min: 24000, max: 32333, rate: 25 },
        { min: 32333, max: 500000, rate: 30 },
        { min: 500000, max: 800000, rate: 32.5 },
        { min: 800000, max: Number.POSITIVE_INFINITY, rate: 35 },
    ];
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const getTemplateById = (id: string) => salaryTemplates.find(s => s.id === id);
    const getBasicTemplate = () =>
        salaryTemplates.find(s =>
            s.type === "earning" && (
                s.code?.toLowerCase() === "basic" ||
                s.name?.toLowerCase().includes("basic")
            )
        );
    const getBasicSalaryAmount = () => {
        const basicTemplate = getBasicTemplate();
        if (!basicTemplate) return 0;
        const basicRow = salaryRows.find(row => row.salaryComponentId === basicTemplate.id);
        return basicRow?.amount || 0;
    };
    const upsertSalaryRow = (salaryComponentId: string, amount: number, source: "manual" | "auto" = "manual") => {
        setSalaryRows(prev => {
            const idx = prev.findIndex(row => row.salaryComponentId === salaryComponentId);
            if (idx === -1) return [...prev, { salaryComponentId, amount, source }];
            const copy = [...prev];
            copy[idx] = { ...copy[idx], amount, source };
            return copy;
        });
    };
    const removeSalaryRow = (salaryComponentId: string) => {
        setSalaryRows(prev => prev.filter(row => row.salaryComponentId !== salaryComponentId));
    };
    const calculatePaye = (taxable: number, shifAmount: number) => {
        let remaining = Math.max(0, taxable);
        let tax = 0;
        for (const band of payeBands) {
            if (remaining <= 0) break;
            const width = band.max === Number.POSITIVE_INFINITY ? remaining : Math.max(0, band.max - band.min);
            const taxableInBand = Math.min(remaining, width);
            tax += (taxableInBand * band.rate) / 100;
            remaining -= taxableInBand;
        }
        const personalRelief = 2400;
        const insuranceRelief = Math.min((shifAmount * 15) / 100, 5000);
        return round2(Math.max(0, tax - personalRelief - insuranceRelief));
    };
    const applyMandatoryDeductions = (basicSalary: number) => {
        if (basicSalary <= 0) return;
        const nssfTemplate = salaryTemplates.find(s => s.type === "deduction" && s.isStatutory && (s.statutoryType || "").toLowerCase() === "nssf");
        const payeTemplate = salaryTemplates.find(s => s.type === "deduction" && s.isStatutory && (s.statutoryType || "").toLowerCase() === "paye");
        const shifTemplate = salaryTemplates.find(s => s.type === "deduction" && s.isStatutory && ["shif", "nhif"].includes((s.statutoryType || "").toLowerCase()));
        const housingTemplate = salaryTemplates.find(s => s.type === "deduction" && s.isStatutory && ["housing_levy", "ahl"].includes((s.statutoryType || "").toLowerCase()));

        const nssf = round2(Math.min(basicSalary, 9000) * 0.06 + Math.max(0, Math.min(basicSalary, 108000) - 9000) * 0.06);
        const shif = round2(Math.max(300, basicSalary * 0.0275));
        const housing = round2(basicSalary * 0.015);
        const paye = calculatePaye(Math.max(0, basicSalary - nssf), shif);

        if (nssfTemplate) upsertSalaryRow(nssfTemplate.id, nssf, "auto");
        if (shifTemplate) upsertSalaryRow(shifTemplate.id, shif, "auto");
        if (housingTemplate) upsertSalaryRow(housingTemplate.id, housing, "auto");
        if (payeTemplate) upsertSalaryRow(payeTemplate.id, paye, "auto");
    };

    const handleNext = () => {
        if (!validate(currentStep)) return;
        if (!completedSteps.includes(currentStep)) setCompletedSteps(p => [...p, currentStep]);
        setCurrentStep(s => s + 1);
    };

    const handleBack = () => setCurrentStep(s => s - 1);

    const handleSkip = () => {
        if (!completedSteps.includes(currentStep)) setCompletedSteps(p => [...p, currentStep]);
        setCurrentStep(s => s + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requiredSteps = isEdit ? [1, 2] : [1, 2, 4];
        for (const s of requiredSteps) {
            if (!validate(s)) { setCurrentStep(s); return; }
        }
        setIsSubmitting(true);
        setSubmitError("");
        try {
            if (isEdit && employee) {
                if (photoFile) {
                    const fd = new FormData(); fd.append("photo", photoFile);
                    const pr = await api.post(`/employees/${employee.id}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                    await api.put(`/employees/${employee.id}`, { ...form, photoUrl: pr.data.photoUrl });
                } else {
                    await api.put(`/employees/${employee.id}`, form);
                }
            } else {
                const fd = new FormData();
                const data: any = { ...form, bankDetails: bankDetails.length > 0 ? bankDetails : undefined, documentsMetadata: documents.map(d => d.metadata) };
                Object.keys(data).forEach(k => {
                    const v = data[k];
                    if (v !== undefined && v !== null && v !== "") {
                        if (k === "bankDetails" || k === "documentsMetadata") fd.append(k, JSON.stringify(v));
                        else fd.append(k, v);
                    }
                });
                if (photoFile) fd.append("photo", photoFile);
                documents.forEach(d => fd.append("documents", d.file));
                const created = await api.post("/employees", fd, { headers: { "Content-Type": "multipart/form-data" } });
                const createdEmployeeId = created?.data?.employee?.id;
                if (createdEmployeeId && salaryRows.length > 0) {
                    await api.post(`/employees/${createdEmployeeId}/salary`, {
                        effectiveFrom: form.hireDate || new Date().toISOString().split("T")[0],
                        reason: "Initial salary setup during employee onboarding",
                        components: salaryRows.map(row => ({
                            salaryComponentId: row.salaryComponentId,
                            amount: row.amount,
                        })),
                    });
                }
            }
            setSubmitSuccess(true);
            setTimeout(() => { setVisible(false); setTimeout(onSuccess, 320); }, 1400);
        } catch (err: any) {
            const ed = err.response?.data;
            setSubmitError(ed?.error || ed?.errors?.[0]?.msg || "Failed to save. Please try again.");
            if (ed?.fieldErrors) setErrors(ed.fieldErrors);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Bank helpers
    const addBank = () => setBankDetails(b => [...b, { paymentMethod: "bank", isPrimary: b.length === 0, bankName: "", accountNumber: "", accountName: "", bankBranch: "", swiftCode: "", mpesaPhone: "", mpesaName: "" }]);
    const removeBank = (i: number) => setBankDetails(b => b.filter((_, x) => x !== i));
    const updateBank = (i: number, f: string, v: any) => {
        const updated = [...bankDetails];
        updated[i] = { ...updated[i], [f]: v };
        if (f === "isPrimary" && v === true) {
            for (let idx = 0; idx < updated.length; idx++) {
                if (idx !== i) updated[idx] = { ...updated[idx], isPrimary: false };
            }
        }
        setBankDetails(updated);
    };

    // Doc helpers
    const addDoc = () => {
        const fi = document.createElement("input"); fi.type = "file"; fi.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
        fi.onchange = (e: any) => { const file = e.target.files?.[0]; if (file) setDocuments(d => [...d, { file, metadata: { documentType: "other", documentName: file.name, expiryDate: "" } }]); };
        fi.click();
    };
    const removeDoc = (i: number) => setDocuments(d => d.filter((_, x) => x !== i));
    const updateDocMeta = (i: number, f: string, v: string) => { const u = [...documents]; u[i] = { ...u[i], metadata: { ...u[i].metadata, [f]: v } }; setDocuments(u); };

    const deptOpts = [{ value: "", label: "Select department" }, ...departments.map(d => ({ value: d.id, label: d.name }))];
    const roleOpts = [{ value: "", label: "Select role" }, ...roles.map(r => ({ value: r.id, label: (r as any).displayName || r.name }))];

    /* ── step content ── */
    const renderStep = () => {
        switch (currentStep) {
            case 1: return (
                <div>
                    {/* Photo upload — prominent */}
                    <div className="flex items-center gap-6 mb-8 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                        <div className="relative shrink-0">
                            {photoPreview
                                ? <img src={photoPreview} alt="" className="w-26 h-26 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                                : <div className="w-26 h-26 rounded-2xl bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md">
                                    {form.firstName?.[0] || "?"}{form.lastName?.[0] || ""}
                                </div>
                            }
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-800 mb-1">Profile Photo</p>
                            <p className="text-sm text-slate-500 mb-3">Upload a clear photo. JPG, PNG accepted.</p>
                            <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-300 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors">
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) { setPhotoFile(f); const r = new FileReader(); r.onloadend = () => setPhotoPreview(r.result as string); r.readAsDataURL(f); }
                                }} />
                                <FiCamera className="w-4 h-4" /> {photoPreview ? "Change Photo" : "Upload Photo"}
                            </label>
                        </div>
                    </div>

                    <FormSection title="Basic Information">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="First Name" labelClassName="text-sm" name="firstName" value={form.firstName} onChange={e => set("firstName", e.target.value)} error={errors.firstName} />
                            <Input label="Middle Name" labelClassName="text-sm" name="middleName" value={form.middleName || ""} onChange={e => set("middleName", e.target.value)} />
                            <Input label="Last Name" labelClassName="text-sm" name="lastName" value={form.lastName} onChange={e => set("lastName", e.target.value)} error={errors.lastName} />
                            <DateInput label="Date of Birth" labelClassName="text-sm" name="dateOfBirth" value={form.dateOfBirth || ""} onChange={e => set("dateOfBirth", (e as any).target.value)} />
                            <Select label="Gender" labelClassName="text-sm" value={form.gender || ""} onChange={e => set("gender", e.target.value)}
                                options={[{ value: "", label: "Select" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} />
                            <Select label="Marital Status" labelClassName="text-sm" value={form.maritalStatus || ""} onChange={e => set("maritalStatus", e.target.value)}
                                options={[{ value: "", label: "Select" }, { value: "Single", label: "Single" }, { value: "Married", label: "Married" }, { value: "Divorced", label: "Divorced" }, { value: "Widowed", label: "Widowed" }]} />
                            <Input label="Nationality" labelClassName="text-sm" name="nationality" value={form.nationality || ""} onChange={e => set("nationality", e.target.value)} className="col-span-3 " />
                        </div>
                    </FormSection>

                    <FormSection title="Contact Information">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Work Email *" name="workEmail" type="email" value={form.workEmail || ""} onChange={e => set("workEmail", e.target.value)} error={errors.workEmail} />
                            <Input label="Personal Email" name="personalEmail" type="email" value={form.personalEmail || ""} onChange={e => set("personalEmail", e.target.value)} />
                            <Input label="Primary Phone *" name="phonePrimary" type="tel" value={form.phonePrimary || ""} onChange={e => set("phonePrimary", e.target.value)} error={errors.phonePrimary} />
                            <Input label="Secondary Phone" name="phoneSecondary" type="tel" value={form.phoneSecondary || ""} onChange={e => set("phoneSecondary", e.target.value)} />
                        </div>
                    </FormSection>

                    <FormSection title="Address">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Address Line 1" name="addressLine1" value={form.addressLine1 || ""} onChange={e => set("addressLine1", e.target.value)} />
                            <Input label="Address Line 2" name="addressLine2" value={form.addressLine2 || ""} onChange={e => set("addressLine2", e.target.value)} />
                            <Input label="City" name="city" value={form.city || ""} onChange={e => set("city", e.target.value)} />
                            <Input label="County" name="county" value={form.county || ""} onChange={e => set("county", e.target.value)} />
                            <Input label="Postal Code" name="postalCode" value={form.postalCode || ""} onChange={e => set("postalCode", e.target.value)} />
                            <Input label="Country" name="country" value={form.country || ""} onChange={e => set("country", e.target.value)} />
                        </div>
                    </FormSection>
                </div>
            );

            case 2: return (
                <div>
                    <FormSection title="Role & Department">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Job Title *" name="jobTitle" value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} error={errors.jobTitle} />
                            <Input label="Job Grade" name="jobGrade" value={form.jobGrade || ""} onChange={e => set("jobGrade", e.target.value)} />
                            <Select label="Department" value={form.departmentId || ""} onChange={e => set("departmentId", e.target.value)} options={deptOpts} />
                            <Select label="Employment Type *" value={form.employmentType} onChange={e => set("employmentType", e.target.value)}
                                options={[{ value: "permanent", label: "Permanent" }, { value: "contract", label: "Contract" }, { value: "casual", label: "Casual" }, { value: "intern", label: "Intern" }]} />
                        </div>
                    </FormSection>

                    <FormSection title="Dates">
                        <div className="grid grid-cols-3 gap-4">
                            <DateInput label="Hire Date *" name="hireDate" value={form.hireDate} onChange={e => set("hireDate", (e as any).target.value)} error={errors.hireDate} />
                            <DateInput label="Probation End Date" name="probationEndDate" value={form.probationEndDate || ""} onChange={e => set("probationEndDate", (e as any).target.value)} />
                            {form.employmentType === "contract" && (
                                <DateInput label="Contract End Date" name="contractEndDate" value={form.contractEndDate || ""} onChange={e => set("contractEndDate", (e as any).target.value)} />
                            )}
                        </div>
                    </FormSection>

                    <FormSection title="Emergency Contact">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Contact Name" name="emergencyContactName" value={form.emergencyContactName || ""} onChange={e => set("emergencyContactName", e.target.value)} />
                            <Input label="Contact Phone" name="emergencyContactPhone" type="tel" value={form.emergencyContactPhone || ""} onChange={e => set("emergencyContactPhone", e.target.value)} />
                            <Input label="Relationship" name="emergencyContactRelationship" value={form.emergencyContactRelationship || ""} onChange={e => set("emergencyContactRelationship", e.target.value)} />
                        </div>
                    </FormSection>
                </div>
            );

            case 3: return (
                <div>
                    <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-2xl px-5 py-4 mb-7">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <FiShield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary-800 mb-0.5">Optional but recommended</p>
                            <p className="text-sm text-primary-600">These IDs are required for accurate PAYE, NSSF and NHIF statutory deductions.</p>
                        </div>
                    </div>
                    <FormSection title="Government & Statutory IDs">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="National ID" name="nationalId" value={form.nationalId || ""} onChange={e => set("nationalId", e.target.value)} />
                            <Input label="Passport Number" name="passportNumber" value={form.passportNumber || ""} onChange={e => set("passportNumber", e.target.value)} />
                            <Input label="KRA PIN" name="kraPin" value={form.kraPin || ""} onChange={e => set("kraPin", e.target.value)} />
                            <Input label="NSSF Number" name="nssfNumber" value={form.nssfNumber || ""} onChange={e => set("nssfNumber", e.target.value)} />
                            <Input label="NHIF Number" name="nhifNumber" value={form.nhifNumber || ""} onChange={e => set("nhifNumber", e.target.value)} />
                        </div>
                    </FormSection>
                </div>
            );

            case 4: return (
                <div>
                    <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-2xl px-5 py-4 mb-7">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <FiLock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary-800 mb-0.5">System login credentials</p>
                            <p className="text-sm text-primary-600">The employee will use their work email and this password to sign in to the payroll system.</p>
                        </div>
                    </div>

                    <FormSection title="Login Details">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Input label="Work Email (used as login)" name="workEmail" type="email" value={form.workEmail || ""} disabled onChange={() => { }} />
                            </div>
                            <Select label="System Role *" value={form.roleId || ""} onChange={e => set("roleId", e.target.value)} options={roleOpts} error={errors.roleId} />
                            <div />
                            <Input label="Password *" name="userPassword" type="password" value={form.userPassword || ""} onChange={e => set("userPassword", e.target.value)} error={errors.userPassword} placeholder="Minimum 8 characters" />
                            <Input label="Confirm Password" name="confirmPassword" type="password" value={confirmPassword} onChange={e => {
                                setConfirmPassword(e.target.value);
                                if (e.target.value !== form.userPassword) setErrors(er => ({ ...er, confirmPassword: "Passwords do not match" }));
                                else setErrors(er => { const u = { ...er }; delete u.confirmPassword; return u; });
                            }} error={errors.confirmPassword} placeholder="Re-enter password" />
                        </div>
                    </FormSection>

                    {isEdit && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                            <p className="text-sm font-semibold text-amber-800">Leave password blank to keep the existing password unchanged.</p>
                        </div>
                    )}
                </div>
            );

            case 5: return (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <p className="text-lg font-bold text-tertiary-700">Payment Methods</p>
                            <div className="h-4 w-px bg-gray-400" />
                            <p className="text-[0.9rem] text-slate-500 mt-0.5">How this employee receives their salary</p>
                        </div>
                        <button onClick={addBank} className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-300 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors">
                            <FiPlus className="w-4 h-4" /> Add Payment Method
                        </button>
                    </div>

                    {bankDetails.length === 0
                        ? <div className="flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed border-slate-200 rounded-3xl">

                            <TbAlertTriangle className="text-gray-400 w-16 h-16" />
                            <div className="text-center">
                                <p className="font-semibold text-slate-700 mb-1">No payment methods yet !</p>
                                <p className="text-[0.9rem] text-slate-400">Add a bank account or M-Pesa number for salary payments</p>
                            </div>
                            <button onClick={addBank} className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-300 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors">
                                <FiPlus className="w-4 h-4" /> Add Payment Method
                            </button>
                        </div>
                        : <div className="space-y-4">
                            {bankDetails.map((bd, i) => (
                                <div key={i} className="border border-slate-200 rounded-3xl p-5 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-slate-700">Payment Option {i + 1}</span>
                                        <button onClick={() => removeBank(i)} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 hover:bg-rose-100 transition-colors">
                                            <FiTrash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select label="Payment Method" value={bd.paymentMethod} onChange={e => updateBank(i, "paymentMethod", e.target.value)}
                                            options={[{ value: "bank", label: "Bank Transfer" }, { value: "mpesa", label: "M-Pesa" }, { value: "cash", label: "Cash" }]} />
                                        <div className="flex items-center gap-3 pt-7">
                                            <Toggle checked={bd.isPrimary ?? false} onChange={v => updateBank(i, "isPrimary", v)} />
                                            <span className="text-sm font-semibold text-slate-700">Set as primary</span>
                                        </div>
                                        {bd.paymentMethod === "bank" && <>
                                            <Input label="Bank Name *" value={bd.bankName || ""} onChange={e => updateBank(i, "bankName", e.target.value)} error={errors[`bankName_${i}`]} />
                                            <Input label="Account Number *" value={bd.accountNumber || ""} onChange={e => updateBank(i, "accountNumber", e.target.value)} error={errors[`accountNumber_${i}`]} />
                                            <Input label="Account Name" value={bd.accountName || ""} onChange={e => updateBank(i, "accountName", e.target.value)} />
                                            <Input label="Branch" value={bd.bankBranch || ""} onChange={e => updateBank(i, "bankBranch", e.target.value)} />
                                            <Input label="SWIFT Code" value={bd.swiftCode || ""} onChange={e => updateBank(i, "swiftCode", e.target.value)} />
                                        </>}
                                        {bd.paymentMethod === "mpesa" && <>
                                            <Input label="M-Pesa Phone *" value={bd.mpesaPhone || ""} onChange={e => updateBank(i, "mpesaPhone", e.target.value)} error={errors[`mpesaPhone_${i}`]} />
                                            <Input label="M-Pesa Name" value={bd.mpesaName || ""} onChange={e => updateBank(i, "mpesaName", e.target.value)} />
                                        </>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            );

            case 6: return (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <p className="text-lg font-bold text-tertiary-700">Employee Documents</p>
                            <div className="h-4 w-px bg-gray-400" />
                            <p className="text-[0.9rem] text-slate-500 mt-0.5">Upload contracts, ID copies, certificates, etc.</p>
                        </div>
                        <button onClick={addDoc} className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-300 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors">
                            <FiUpload className="w-4 h-4" /> Upload Document
                        </button>
                    </div>

                    {documents.length === 0
                        ? <div className="flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed border-slate-200 rounded-3xl">
                            <FiFile className="w-16 h-16 text-gray-400" />
                            <div className="text-center">
                                <p className="font-semibold text-slate-700 mb-1">No documents uploaded !</p>
                                <p className="text-[0.9rem] text-slate-400">You can also add documents from the employee profile later</p>
                            </div>
                            <button onClick={addDoc} className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-300 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors">
                                <FiUpload className="w-4 h-4" /> Upload First Document
                            </button>
                        </div>
                        : <div className="space-y-4">
                            {documents.map((doc, i) => (
                                <div key={i} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><FiFile className="w-4 h-4" /></div>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-xs">{doc.file.name}</span>
                                        </div>
                                        <button onClick={() => removeDoc(i)} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 hover:bg-rose-100 transition-colors">
                                            <FiTrash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Select label="Document Type" value={doc.metadata.documentType} onChange={e => updateDocMeta(i, "documentType", e.target.value)}
                                            options={[{ value: "contract", label: "Contract" }, { value: "id", label: "National ID" }, { value: "passport", label: "Passport" }, { value: "certificate", label: "Certificate" }, { value: "other", label: "Other" }]} />
                                        <Input label="Document Name" value={doc.metadata.documentName} onChange={e => updateDocMeta(i, "documentName", e.target.value)} />
                                        <DateInput label="Expiry Date (opt)" value={doc.metadata.expiryDate || ""} onChange={e => updateDocMeta(i, "expiryDate", (e as any).target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            );

            case 7: {
                const basicTemplate = getBasicTemplate();
                const mandatoryRows = salaryRows.filter(row => {
                    const component = getTemplateById(row.salaryComponentId);
                    return component?.isStatutory;
                });
                const earnings = salaryRows
                    .filter(row => getTemplateById(row.salaryComponentId)?.type === "earning")
                    .reduce((sum, row) => sum + row.amount, 0);
                const deductions = salaryRows
                    .filter(row => getTemplateById(row.salaryComponentId)?.type === "deduction")
                    .reduce((sum, row) => sum + row.amount, 0);
                return (
                    <div className="space-y-6">
                        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                            <p className="text-sm font-semibold text-primary-700">
                                Set basic salary first. PAYE, NSSF, SHIF and Housing Levy are auto-calculated and can be edited.
                            </p>
                        </div>

                        <FormSection title="Basic Salary">
                            {!basicTemplate ? (
                                <div className="text-sm text-rose-600">Create a BASIC earning component first in Salary Components.</div>
                            ) : (
                                <Input
                                    label="Basic Salary *"
                                    type="number"
                                    value={String(salaryRows.find(row => row.salaryComponentId === basicTemplate.id)?.amount || "")}
                                    onChange={e => {
                                        const amount = Number(e.target.value || 0);
                                        upsertSalaryRow(basicTemplate.id, amount, "manual");
                                        applyMandatoryDeductions(amount);
                                    }}
                                    error={errors.basicSalary}
                                />
                            )}
                        </FormSection>

                        <FormSection title="Additional Salary Components">
                            <div className="grid grid-cols-3 gap-4 items-end">
                                <Select
                                    label="Select component"
                                    value={selectedSalaryTemplate}
                                    onChange={e => setSelectedSalaryTemplate(e.target.value)}
                                    options={[
                                        { value: "", label: "Select component" },
                                        ...salaryTemplates
                                            .filter(s => s.isActive && (!basicTemplate || s.id !== basicTemplate.id))
                                            .map(s => ({ value: s.id, label: `${s.name} (${s.type})` })),
                                    ]}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (!selectedSalaryTemplate) return;
                                        const selected = getTemplateById(selectedSalaryTemplate);
                                        if (!selected) return;
                                        if (selected.type === "deduction" && getBasicSalaryAmount() <= 0) {
                                            setErrors(prev => ({ ...prev, basicSalary: "Add basic salary before deductions" }));
                                            return;
                                        }
                                        const defaultAmount = Number(selected.defaultAmount || 0);
                                        upsertSalaryRow(selected.id, defaultAmount, "manual");
                                        if (selected.isStatutory) {
                                            applyMandatoryDeductions(getBasicSalaryAmount());
                                        }
                                    }}
                                >
                                    Add Component
                                </Button>
                            </div>
                        </FormSection>

                        <div className="space-y-3">
                            {salaryRows.map(row => {
                                const component = getTemplateById(row.salaryComponentId);
                                if (!component) return null;
                                const isMandatory = component.isStatutory && mandatoryRows.some(m => m.salaryComponentId === row.salaryComponentId);
                                return (
                                    <div key={row.salaryComponentId} className="grid grid-cols-4 gap-4 items-end border border-slate-200 rounded-xl p-3 bg-white">
                                        <div className="col-span-2">
                                            <p className="text-sm font-semibold text-slate-700">{component.name}</p>
                                            <p className="text-xs text-slate-500">{component.type} {isMandatory ? "• Mandatory statutory" : ""}</p>
                                        </div>
                                        <Input
                                            label="Amount"
                                            type="number"
                                            value={String(row.amount)}
                                            onChange={e => upsertSalaryRow(row.salaryComponentId, Number(e.target.value || 0), "manual")}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeSalaryRow(row.salaryComponentId)}
                                            disabled={isMandatory}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-100"><p className="text-xs text-slate-500">Earnings</p><p className="font-bold">KES {earnings.toLocaleString()}</p></div>
                            <div className="p-4 rounded-xl bg-slate-100"><p className="text-xs text-slate-500">Deductions</p><p className="font-bold">KES {deductions.toLocaleString()}</p></div>
                            <div className="p-4 rounded-xl bg-primary-100"><p className="text-xs text-primary-700">Estimated Net</p><p className="font-bold text-primary-800">KES {(earnings - deductions).toLocaleString()}</p></div>
                        </div>
                    </div>
                );
            }

            default: return null;
        }
    };

    const stepCount = isEdit ? 3 : STEPS.length;
    const isLastStep = isEdit ? currentStep === 3 : currentStep === STEPS.length;
    const progress = Math.round((currentStep / stepCount) * 100);

    /* ── render ── */
    return (
        <>

            {/* Backdrop */}
            <div onClick={handleClose}
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full z-100 flex bg-white shadow-[0_0_80px_rgba(0,0,0,0.22)] transform transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
                style={!isEdit ? { width: "min(1200px, 95vw)" } : { width: "min(980px, 92vw)" }}
            >
                {/* ── Success overlay ── */}
                {submitSuccess && (
                    <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center gap-5">
                        <div className="relative w-16 h-16 sm:w-18 mb-3 rounded-full flex items-center justify-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center">
                                <TbCheck className="h-10 w-10 text-primary-700" />
                            </div>
                            <motion.svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                            >
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="47"
                                    fill="none"
                                    stroke="#1d4ed8"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.6, ease: "easeOut" }}
                                />
                            </motion.svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-extrabold text-primary-600 font-source mb-2">Employee Record {isEdit ? "Updated" : "Created"} Successfully!</h3>
                            <p className="text-sm text-slate-500">Closing panel in a moment…</p>
                        </div>
                    </div>
                )}

                {/* ── Left: step rail ── */}
                {!isEdit && (
                    <div className="w-72 shrink-0 flex flex-col bg-primary-700 overflow-hidden relative">
                        {/* dot texture */}
                        <div className="absolute inset-0 opacity-[0.09]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='5' cy='5' r='1'/%3E%3Ccircle cx='20' cy='5' r='1'/%3E%3Ccircle cx='35' cy='5' r='1'/%3E%3Ccircle cx='5' cy='20' r='1'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='35' cy='20' r='1'/%3E%3Ccircle cx='5' cy='35' r='1'/%3E%3Ccircle cx='20' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}
                        />
                        {/* decorative circle */}
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border-36 border-white/10 pointer-events-none" />

                        <div className="relative flex flex-col h-full px-5 py-8">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold text-lg">P</div>
                                <span className="text-white font-semibold text-lg ">Adding New Employee</span>
                            </div>

                            <div className="h-px bg-white/15 mb-6" />

                            {/* Steps */}
                            <nav className="flex flex-col flex-1 gap-0">
                                {STEPS.map((step, idx) => {
                                    const done = completedSteps.includes(step.id);
                                    const active = currentStep === step.id;
                                    const past = step.id < currentStep;
                                    const canNav = done || past;

                                    return (
                                        <div key={step.id} className="relative">
                                            <button type="button" disabled={!canNav}
                                                onClick={() => canNav && setCurrentStep(step.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left ${active ? "bg-white/20 shadow-sm" : canNav ? "hover:bg-white/10 cursor-pointer" : "cursor-default"
                                                    }`}
                                            >
                                                {/* step icon */}
                                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold transition-all ${done && !active ? "bg-emerald-500 text-white shadow-sm" :
                                                    active ? "bg-white text-primary-700 shadow-sm" :
                                                        past ? "bg-white/20 text-white/70" :
                                                            "bg-white/10 text-white/30"
                                                    }`}>
                                                    {done && !active ? <FiCheck className="w-5 h-5" /> : step.icon}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className={` font-semibold leading-tight ${active ? "text-white" : done || past ? "text-white/75" : "text-white/35"
                                                        }`}>
                                                        {step.title}
                                                    </p>
                                                    <p className={`text-sm mt-0.5 truncate ${active ? "text-white/60" : "text-white/25"}`}>
                                                        {step.optional ? "optional" : step.desc}
                                                    </p>
                                                </div>

                                                {active && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                                            </button>

                                            {idx < STEPS.length - 1 && (
                                                <div className={`ml-7 w-px my-0.5 h-3 transition-colors ${done ? "bg-emerald-500/50" : "bg-white/15"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>

                            {/* Progress pill */}
                            <div className="bg-white/10 border border-white/15 rounded-2xl py-2.5 px-4 -mx-2 mt-4">
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-white/60">Progress</span>
                                    <span className="text-white">{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-[12px] text-white/40 mt-2">Step {currentStep} of {STEPS.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Right: form content ── */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top colour bar */}
                    <div className="h-1 w-full bg-linear-to-r from-primary-700 via-primary-600 to-primary-500 shrink-0" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 shrink-0 bg-white">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl font-extrabold text-slate-900">
                                {isEdit ? `Editing — ${employee?.firstName} ${employee?.lastName}` : STEPS[currentStep - 1]?.title}
                            </h2>
                            <div className="h-4 w-px bg-gray-500" />
                            <p className="text-[0.9rem] text-slate-500 mt-0.5">
                                {isEdit ? "Update employee information" : STEPS[currentStep - 1]?.desc}
                                {!isEdit && STEPS[currentStep - 1]?.optional && (
                                    <span className="ml-2 text-xs font-bold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">Optional</span>
                                )}
                            </p>
                        </div>
                        <button onClick={handleClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable form body */}
                    <div className="flex-1 overflow-y-auto px-8 py-7 bg-slate-50/40">
                        {submitError && (
                            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-3 text-sm mb-6">
                                <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                                <span>{submitError}</span>
                            </div>
                        )}
                        <form id="ef-form" onSubmit={handleSubmit}>
                            {renderStep()}
                        </form>
                    </div>

                    {/* Footer nav */}
                    <div className="shrink-0 px-8 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                        <div>
                            {currentStep > 1 && (
                                <Button variant="outline" size="sm" onClick={handleBack} disabled={isSubmitting} className="px-6 py-3">
                                    <TbArrowBack className="w-4 h-4" />Go Back
                                </Button>

                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {!isEdit && !isLastStep && STEPS[currentStep - 1]?.optional && (
                                <Button variant="outline" size="sm" onClick={handleSkip} disabled={isSubmitting} className="px-6 py-3">
                                    Skip this step
                                </Button>
                            )}

                            {isLastStep ? (
                                <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-3">
                                    {isSubmitting
                                        ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                                        : <><FiCheck className="w-4 h-4" />{isEdit ? "Save Changes" : "Create Employee"}</>
                                    }
                                </Button>

                            ) : (
                                <Button variant="primary" size="sm" onClick={handleNext} disabled={isSubmitting} className="px-10 py-3">
                                    Continue <FiArrowRight className="w-4 h-4" />
                                </Button>

                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmployeeFormDrawer;