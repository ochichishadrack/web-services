'use client';

import { JSX, useState } from 'react';
import { FileText, ShieldCheck, BadgePercent, Loader } from 'lucide-react';
import { axiosInstance } from '@/utils/axiosInstance';

/* ---------------- TYPES ---------------- */
export interface Extra {
  id: string;
  title: string;
  price: number;
}
export interface Package {
  id: string;
  name: string;
  price: number;
}
export interface Requirement {
  field: string;
  value: string | number | boolean | string[] | File;
}

export interface OrderPayload {
  buyer_id: string;
  service_id: string;
  package_id: string;
  extras_ids: string[];
  requirements: Requirement[];
  phase?: PaymentOption;
  seller_username: string;
}
export interface Service {
  id: string;
  title: string;
  packages: Package[];
  extras?: Extra[];
}

/* ---------------- PAYMENT TYPES ---------------- */
export type PaymentOption = 'phase1' | 'phase1_2' | 'full';

interface Phase {
  amount: number;
  paid: boolean;
}
interface Phases {
  phase1: Phase;
  phase2: Phase;
  phase3: Phase;
}

/* ---------------- PROPS ---------------- */
interface PaymentComponentProps {
  customer: { email: string; public_id: string };
  orderPayload: OrderPayload;
  selectedPackage: Package;
  selectedExtras: Extra[];
  onClose: () => void;
}

/* ---------------- HELPER ---------------- */
function calculatePhases(total: number, option: PaymentOption) {
  const PHASE_RULES = { phase1: 0.2, phase2: 0.6, phase3: 0.2 };
  const DISCOUNTS: Record<string, number> = { phase1_2: 0.02, full: 0.08 };

  const phases: Phases = {
    phase1: { amount: total * PHASE_RULES.phase1, paid: false },
    phase2: { amount: total * PHASE_RULES.phase2, paid: false },
    phase3: { amount: total * PHASE_RULES.phase3, paid: false },
  };

  let paidPhases: (keyof Phases)[] = [];

  if (option === 'phase1') paidPhases = ['phase1'];
  if (option === 'phase1_2') paidPhases = ['phase1', 'phase2'];
  if (option === 'full') paidPhases = ['phase1', 'phase2', 'phase3'];

  const discount = DISCOUNTS[option] ?? 0;
  let payable = 0;

  paidPhases.forEach((p) => {
    phases[p].paid = true;
    if (discount > 0) phases[p].amount *= 1 - discount;
    payable += phases[p].amount;
  });

  return { phases, payable, discount };
}

/* ---------------- COMPONENT ---------------- */
export default function PaymentComponent({
  customer,
  orderPayload,
  selectedPackage,
  selectedExtras,
  onClose,
}: PaymentComponentProps): JSX.Element {
  const [option, setOption] = useState<PaymentOption>('phase1');
  const [accepted, setAccepted] = useState<boolean>(false);
  const [showContract, setShowContract] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const backendTotal = selectedPackage.price + extrasTotal;

  const { phases, payable, discount } = calculatePhases(backendTotal, option);
  const discountAmount = Math.round(backendTotal * discount);

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePay = async (): Promise<void> => {
    if (!accepted) {
      alert('Accept terms first');
      return;
    }

    setLoading(true);

    try {
      const amountKobo = Math.round(payable * 100);
      const formData = new FormData();

      const requirementsArray = Array.isArray(orderPayload.requirements)
        ? orderPayload.requirements
        : Object.entries(orderPayload.requirements).map(([field, value]) => ({ field, value }));

      const cleanedRequirements = requirementsArray.map((r) => {
        const files: File[] = [];

        if (r.value instanceof File) {
          files.push(r.value);
          formData.append('files', r.value);
        } else if (Array.isArray(r.value)) {
          r.value.forEach((v) => {
            if (v instanceof File) {
              files.push(v);
              formData.append('files', v);
            }
          });
        }

        return {
          requirement_id: r.field,
          answer_text: typeof r.value === 'string' ? r.value.trim() : '',
          answer_choice:
            Array.isArray(r.value) && r.value.every((v) => typeof v !== 'object') ? r.value : [],
          has_file: files.length > 0,
        };
      });

      const payload = {
        service_id: orderPayload.service_id,
        package_id: orderPayload.package_id,
        buyer_id: customer.public_id,
        extras_ids: orderPayload.extras_ids,
        phase: option,
        payment_type: 'service',
        amount: amountKobo,
        email: customer.email,
        requirements: cleanedRequirements,
        callback_url: `${window.location.origin}/payment/verify`,
      };

      formData.append('payload_json', JSON.stringify(payload));

      const res = await axiosInstance.post('/api/paystack/initialize', formData);

      const { authorization_url, reference } = res.data;

      if (!authorization_url || !reference) {
        throw new Error('Invalid payment initialization response');
      }

      localStorage.setItem('paystack_ref', reference);
      window.location.href = authorization_url;
    } catch (err: unknown) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : 'Failed to initialize payment. Check console.';

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6 flex justify-center transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-colors">
        {/* HEADER */}
        <div className="bg-black dark:bg-white text-white dark:text-black p-6 text-center transition-colors">
          <h1 className="text-2xl font-bold">Contract Payment Plan</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* SERVICE CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Service</p>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedPackage.name}
                </h2>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Contract Value</p>

                <div className="mt-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-black px-3 py-2 rounded-xl text-sm font-semibold">
                  KES {backendTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* PHASES */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Project Milestones
            </h2>

            <PhaseBox
              title="Phase 1"
              percent="20%"
              amount={phases.phase1.amount}
              description="Covers onboarding, planning, design direction, and technical project setup."
            />

            <PhaseBox
              title="Phase 2"
              percent="60%"
              amount={phases.phase2.amount}
              description="Execution of core design, development, integrations, and system functionality."
            />

            <PhaseBox
              title="Phase 3"
              percent="20%"
              amount={phases.phase3.amount}
              description="Final revisions, testing, deployment, and full project handover."
            />
          </div>

          {/* PAYMENT OPTIONS */}
          <div className="space-y-3">
            <h2 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <BadgePercent className="w-4 h-4" /> Payment Options
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please select preferred payment option to continue
            </p>

            <OptionCard
              label="Phase 1 Deposit"
              desc="Secure project initiation"
              badge="20%"
              value="phase1"
              option={option}
              setOption={setOption}
            />

            <OptionCard
              label="Phase 1 + Phase 2"
              desc="Advance payment discount applied"
              badge="Save 2%"
              value="phase1_2"
              option={option}
              setOption={setOption}
            />

            <OptionCard
              label="Full Project Payment"
              desc="Maximum contract savings"
              badge="Save 8%"
              value="full"
              option={option}
              setOption={setOption}
            />
          </div>

          {/* TERMS */}
          <div className="border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 pt-4 space-y-4">
            <button
              onClick={() => setShowContract(true)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FileText className="w-4 h-4" /> View Service Payment Agreement
            </button>

            <label className="flex items-start gap-3 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>
                I confirm that I have reviewed and accepted the phased payment terms and contractual
                service agreement.
              </span>
            </label>
          </div>

          {/* SUMMARY + BUTTONS */}
          <div className="w-full mt-4 md:mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount Payable</span>

              <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                KES {payable.toLocaleString()}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-green-500">Discount Applied</span>
                <span className="text-green-500 font-semibold">
                  KES {discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back to Checkout
              </button>

              <button
                disabled={!accepted || loading}
                onClick={handlePay}
                className={`flex-1 py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-md
                ${
                  accepted
                    ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.97]'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
              Secure payment protected by encrypted processing.
            </p>
          </div>
        </div>
      </div>

      {showContract && <ContractModal onClose={() => setShowContract(false)} />}
    </div>
  );
}

/* ---------------- SUB COMPONENTS ---------------- */

interface PhaseBoxProps {
  title: string;
  percent: string;
  amount: number;
  description: string;
}

function PhaseBox({ title, percent, amount, description }: PhaseBoxProps): JSX.Element {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">{title}</h3>

        <span className="text-xs bg-green-100 dark:bg-green-900 text-gray-600 dark:text-green-300 px-2 py-1 rounded-full">
          {percent}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>

      <p className="text-sm text-gray-600 dark:text-gray-300 font-bold mt-3">
        KES {amount.toLocaleString()}
      </p>
    </div>
  );
}

interface OptionCardProps {
  label: string;
  desc: string;
  badge: string;
  value: PaymentOption;
  option: PaymentOption;
  setOption: (value: PaymentOption) => void;
}

function OptionCard({
  label,
  desc,
  badge,
  value,
  option,
  setOption,
}: OptionCardProps): JSX.Element {
  const active = option === value;

  return (
    <label
      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition
      ${
        active
          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800 shadow-sm'
          : 'hover:border-gray-400 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          checked={active}
          onChange={() => setOption(value)}
          className="mt-1 accent-black dark:accent-white"
        />

        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{desc}</p>
        </div>
      </div>

      <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-full">
        {badge}
      </span>
    </label>
  );
}

interface ContractModalProps {
  onClose: () => void;
}

function ContractModal({ onClose }: ContractModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4 text-sm">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
          Service Payment Terms & Agreement
        </h2>

        <p>
          This contract outlines the phased payment model to ensure financial flexibility while
          maintaining project accountability. All phases must be completed sequentially.
        </p>

        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            <strong>Phase 1:</strong> Project Initiation - 20% deposit.
          </li>
          <li>
            <strong>Phase 2:</strong> Design & Development - 60% payment.
          </li>
          <li>
            <strong>Phase 3:</strong> Delivery & Launch - Final 20%.
          </li>
        </ul>

        <button
          onClick={onClose}
          className="bg-black dark:bg-white text-white dark:text-black w-full py-2 rounded-xl mt-2"
        >
          Close Agreement
        </button>
      </div>
    </div>
  );
}
