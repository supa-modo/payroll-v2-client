import type { SalaryComponent } from "../types/salary";

const round2 = (n: number) => Math.round(n * 100) / 100;

const payeBands: Array<{ min: number; max: number; rate: number }> = [
  { min: 0, max: 24000, rate: 10 },
  { min: 24000, max: 32333, rate: 25 },
  { min: 32333, max: 500000, rate: 30 },
  { min: 500000, max: 800000, rate: 32.5 },
  { min: 800000, max: Number.POSITIVE_INFINITY as any, rate: 35 },
];

export function calculateNssf(basicSalary: number): number {
  // Kenya NSSF two-tier rules (as used by the existing UI logic)
  return round2(
    Math.min(basicSalary, 9000) * 0.06 +
      Math.max(0, Math.min(basicSalary, 108000) - 9000) * 0.06
  );
}

export function calculateShif(grossSalary: number): number {
  // SHIF employee contribution: 2.75% of gross, min KES 300
  return round2(Math.max(300, grossSalary * 0.0275));
}

export function calculateHousingLevy(grossSalary: number): number {
  // Housing Levy: 1.5% of gross salary
  return round2(grossSalary * 0.015);
}

export function calculatePaye(taxableIncome: number, shifAmount: number): number {
  // PAYE progressive bands with personal + insurance relief after band calculation.
  let remaining = Math.max(0, taxableIncome);
  let tax = 0;

  for (const band of payeBands) {
    if (remaining <= 0) break;
    const width =
      band.max === (Number.POSITIVE_INFINITY as any)
        ? remaining
        : Math.max(0, band.max - band.min);

    const taxableInBand = Math.min(remaining, width);
    tax += (taxableInBand * band.rate) / 100;
    remaining -= taxableInBand;
  }

  const personalRelief = 2400;
  const insuranceRelief = Math.min((shifAmount * 15) / 100, 5000);
  return round2(Math.max(0, tax - personalRelief - insuranceRelief));
}

export function autoCalcStatutoryAmount(
  component: Pick<SalaryComponent, "isStatutory" | "type" | "statutoryType">,
  basicSalary: number
): number | null {
  if (!component.isStatutory) return null;
  if (component.type !== "deduction") return null;

  // Avoid SHIF min contribution being applied when basic salary hasn't been entered yet.
  if (!basicSalary || basicSalary <= 0) return 0;

  const st = (component.statutoryType || "").toLowerCase();
  switch (st) {
    case "nssf": {
      return calculateNssf(basicSalary);
    }
    case "shif":
    case "nhif": {
      return calculateShif(basicSalary);
    }
    case "housing_levy":
    case "ahl": {
      return calculateHousingLevy(basicSalary);
    }
    case "paye": {
      const nssf = calculateNssf(basicSalary);
      const shif = calculateShif(basicSalary);
      const taxable = Math.max(0, basicSalary - nssf);
      return calculatePaye(taxable, shif);
    }
    default:
      return null;
  }
}

