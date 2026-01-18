/**
 * Tax Remittances API
 */

import api from "../services/api";
import { TaxRemittance } from "../types/report";

export interface RemittanceFilters {
  status?: "pending" | "remitted";
  taxType?: "PAYE" | "NSSF" | "NHIF";
  startDate?: string;
  endDate?: string;
  includeOverdue?: boolean;
}

export interface RemittanceReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    pendingPAYE: number;
    pendingNSSF: number;
    pendingNHIF: number;
    remittedPAYE: number;
    remittedNSSF: number;
    remittedNHIF: number;
  };
  history: TaxRemittance[];
  pending: TaxRemittance[];
}

/**
 * Get remittances with filters
 */
export async function getRemittances(
  filters?: RemittanceFilters
): Promise<{ remittances: TaxRemittance[] }> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.taxType) {
    params.append("taxType", filters.taxType);
  }
  if (filters?.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    params.append("endDate", filters.endDate);
  }
  if (filters?.includeOverdue !== undefined) {
    params.append("includeOverdue", filters.includeOverdue.toString());
  }

  const response = await api.get(`/tax-remittances?${params.toString()}`);
  return response.data;
}

/**
 * Mark remittance as remitted
 */
export async function markAsRemitted(
  remittanceId: string,
  remittanceReference: string,
  notes?: string
): Promise<{ remittance: TaxRemittance; message: string }> {
  const response = await api.post(`/tax-remittances/${remittanceId}/mark-remitted`, {
    remittanceReference,
    notes,
  });
  return response.data;
}

/**
 * Get remittance report
 */
export async function getRemittanceReport(
  startDate: string,
  endDate: string
): Promise<{ report: RemittanceReport }> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await api.get(`/tax-remittances/report?${params.toString()}`);
  return response.data;
}
