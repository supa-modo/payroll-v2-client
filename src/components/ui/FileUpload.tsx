import React, { useRef, useState } from "react";
import { FiUpload, FiX, FiFile } from "react-icons/fi";
import { clsx } from "clsx";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  value,
  onChange,
  error,
  helperText,
  disabled,
  required,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      onChange?.(null);
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(", "));
      return;
    }

    setErrorMessage("");
    if (multiple) {
      onChange?.(validFiles);
    } else {
      onChange?.(validFiles[0] || null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileSelect(files);
  };

  const handleRemove = () => {
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileDisplay = () => {
    if (!value) return null;

    if (multiple && Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
            >
              <FiFile className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    const file = Array.isArray(value) ? value[0] : value;
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
        <FiFile className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700 flex-1 truncate">
          {file.name}
        </span>
        <span className="text-xs text-gray-500">
          {(file.size / 1024).toFixed(2)} KB
        </span>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full mb-5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={clsx(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive
            ? "border-primary-500 bg-primary-50"
            : error || errorMessage
            ? "border-red-500 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {!value || (Array.isArray(value) && value.length === 0) ? (
          <div className="text-center">
            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop files here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Max size: {(maxSize / 1024 / 1024).toFixed(2)}MB
            </p>
          </div>
        ) : (
          <div>{getFileDisplay()}</div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {(error || errorMessage) && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">
          {error || errorMessage}
        </p>
      )}

      {helperText && !error && !errorMessage && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;

