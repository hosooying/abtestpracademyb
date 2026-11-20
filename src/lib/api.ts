import type {
  MasterclassSession,
  PlanId,
  SubscriptionOrder,
  SubscriptionPlan,
  UserProfile,
} from '../types';
import {
  localFetchCatalog,
  localFetchCurrentUser,
  localLoginWithPassword,
  localRegisterAccount,
  localSubmitCheckout,
  localVerifyExistingStudentId,
} from './localBackend';

const TOKEN_STORAGE_KEY = 'pr_academy_session_token';

export function getStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures
  }
}

export interface CatalogResponse {
  plans: SubscriptionPlan[];
  classes: MasterclassSession[];
  concessionRules: {
    over40Rate: number;
    existingStudentRate: number;
    combinedMaxRate: number;
    over40Threshold: number;
  };
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  return localFetchCatalog();
}

export async function fetchCurrentUser(): Promise<{
  user: UserProfile | null;
  orders: SubscriptionOrder[];
}> {
  return localFetchCurrentUser(getStoredToken());
}

export async function registerAccount(payload: {
  fullName: string;
  email: string;
  password: string;
  dob: string;
  studentId?: string;
}) {
  const res = localRegisterAccount(payload);
  setStoredToken(res.sessionToken);
  return res;
}

export async function loginWithPassword(payload: { email: string; password: string }) {
  const res = localLoginWithPassword(payload);
  setStoredToken(res.sessionToken);
  return res;
}

export async function verifyExistingStudentId(studentId: string) {
  return localVerifyExistingStudentId(getStoredToken(), studentId);
}

export async function logoutUser() {
  setStoredToken(null);
  return { ok: true };
}

export async function submitCheckout(payload: {
  planId: PlanId;
  termUnits: number;
  learningMode: 'In-Person (Singapore)' | 'Live Interactive Stream';
  startDate: string;
  paymentMethod: 'Card' | 'PayNow';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  billingPostalCode: string;
  billingAddress: string;
}) {
  return localSubmitCheckout(getStoredToken(), payload);
}

export function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
