'use client';

import { JSX, useState } from 'react';
import { FileText, ShieldCheck, BadgePercent, Loader, Info, Mail } from 'lucide-react';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLocalCurrency } from '@/hooks/useLocalCurrency';

/* ---------------- TYPES ---------------- */
export interface Extra {
  id: string;
  title: string;
  price: number; // USD
}
export interface Package {
  id: string;
  name: string;
  price: number; // USD
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

/* ---------------- WHATSAPP ICON ---------------- */
function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
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
  const { getReferralCode } = useCustomerAuth();
  const referralCode = getReferralCode();

  const { currency: localCurrency, convert, format, loading: currencyLoading } = useLocalCurrency();

  const isKesSupported = !currencyLoading && localCurrency === 'KES';
  const isOtherCurrency = !currencyLoading && localCurrency !== 'KES';

  const extrasTotalUsd = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const backendTotalUsd = selectedPackage.price + extrasTotalUsd;

  const { phases, payable, discount } = calculatePhases(backendTotalUsd, option);
  const discountAmountUsd = Math.round(backendTotalUsd * discount);

  const formatMoney = (usdAmount: number) => {
    const amount = convert(usdAmount);
    return `KES ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePay = async (): Promise<void> => {
    if (!accepted) {
      alert('Please accept the terms first.');
      return;
    }

    if (!isKesSupported) {
      alert(
        'Online payments are currently available only in Kenyan Shillings (KES). Please contact support.'
      );
      return;
    }

    setLoading(true);

    try {
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
        amount: payable,
        currency: 'KES',
        email: customer.email,
        requirements: cleanedRequirements,
        referral_code: referralCode,
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
        err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6 sm:py-10 flex justify-center transition-colors">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        {/* HEADER */}
        <div className="bg-gray-950 dark:bg-white text-white dark:text-black px-6 py-6 sm:px-8 sm:py-7 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Contract Payment Plan
          </h1>
          <p className="text-sm text-gray-300 dark:text-gray-600 mt-1.5">
            Secure phased payments for your project
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-7">
          {/* ========== NON-KES NOTICE ========== */}
          {isOtherCurrency && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-6 sm:p-7 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Online payments are currently available in Kenya only
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Automated checkout is supported exclusively in{' '}
                    <strong className="text-gray-800 dark:text-gray-200">
                      Kenyan Shillings (KES)
                    </strong>
                    . Your region uses{' '}
                    <strong className="text-gray-800 dark:text-gray-200">{localCurrency}</strong>,
                    which is not yet enabled for online payment.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Please contact our support team to complete this order. We will arrange a
                    suitable payment method for your location.
                  </p>
                </div>
              </div>

              {/* Amount to be paid */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-5 py-4">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Amount to be paid
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  {format(backendTotalUsd)}
                </p>
              </div>

              {/* Professional contact links */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/254113388120"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 flex-1 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium transition shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <a
                  href="mailto:maraspot.ke@gmail.com"
                  className="inline-flex items-center justify-center gap-2.5 flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
              </div>
            </div>
          )}

          {/* ========== KES SUPPORTED FLOW (no notice) ========== */}
          {isKesSupported && (
            <>
              {/* Service Card */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Selected Package
                    </p>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mt-0.5">
                      {selectedPackage.name}
                    </h2>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contract Value</p>
                    <div className="mt-1.5 inline-flex items-center bg-gray-950 dark:bg-white text-white dark:text-black px-3.5 py-2 rounded-xl text-sm font-semibold">
                      {formatMoney(backendTotalUsd)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Project Milestones
                </h2>

                <PhaseBox
                  title="Phase 1"
                  percent="20%"
                  amountLabel={formatMoney(phases.phase1.amount)}
                  description="Onboarding, planning, design direction, and technical project setup."
                />
                <PhaseBox
                  title="Phase 2"
                  percent="60%"
                  amountLabel={formatMoney(phases.phase2.amount)}
                  description="Core design, development, integrations, and system functionality."
                />
                <PhaseBox
                  title="Phase 3"
                  percent="20%"
                  amountLabel={formatMoney(phases.phase3.amount)}
                  description="Final revisions, testing, deployment, and full project handover."
                />
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <h2 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BadgePercent className="w-4 h-4" />
                  Payment Options
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select your preferred payment option to continue
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

              {/* Terms */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-5 space-y-4">
                <button
                  onClick={() => setShowContract(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View Service Payment Agreement
                </button>

                <label className="flex items-start gap-3 text-sm bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    I confirm that I have reviewed and accepted the phased payment terms and
                    contractual service agreement.
                  </span>
                </label>
              </div>

              {/* Summary + Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount Payable</span>
                  <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                    {formatMoney(payable)}
                  </span>
                </div>

                {discountAmountUsd > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      Discount Applied
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      − {formatMoney(discountAmountUsd)}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                  >
                    Back to Checkout
                  </button>

                  <button
                    disabled={!accepted || loading}
                    onClick={handlePay}
                    className={`flex-1 py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm
                    ${
                      accepted
                        ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
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

                <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
                  Secure payment protected by encrypted processing.
                </p>
              </div>
            </>
          )}

          {/* Loading currency state */}
          {currencyLoading && (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Loader className="w-6 h-6 animate-spin" />
              <p className="text-sm">Detecting your currency...</p>
            </div>
          )}
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
  amountLabel: string;
  description: string;
}

function PhaseBox({ title, percent, amountLabel, description }: PhaseBoxProps): JSX.Element {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
          {percent}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{description}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-3">{amountLabel}</p>
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
          ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <span className="text-xs font-medium bg-gray-950 dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full shrink-0">
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 max-w-lg w-full p-6 md:p-8 rounded-2xl shadow-2xl space-y-5 text-sm max-h-[90vh] overflow-y-auto">
        <div className="space-y-1">
          <h2 className="font-bold text-gray-900 dark:text-white text-xl">
            Service Agreement & Payment Terms
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Professional Web Development Services
          </p>
        </div>

        <p className="leading-relaxed">
          This agreement outlines the available payment options for web development projects.
          Clients may choose either a one-time full payment or a structured phased payment plan.
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            Option 1: Full Payment
          </h3>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 rounded-xl p-3">
            <p className="font-medium text-gray-800 dark:text-gray-100">100% upfront payment</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pay the full project amount at the start. Work begins immediately and final delivery
              is made upon completion and client approval.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            Option 2: Phased Payment Plan
          </h3>

          <ul className="space-y-3">
            {[
              {
                n: 1,
                title: 'Project Initiation — 20%',
                desc: 'Covers project scoping, requirements gathering, and kickoff.',
              },
              {
                n: 2,
                title: 'Design & Development — 60%',
                desc: 'Covers UI/UX design, development, integrations, and testing.',
              },
              {
                n: 3,
                title: 'Final Delivery & Launch — 20%',
                desc: 'Payable upon successful deployment, handover, and client approval.',
              },
            ].map((item) => (
              <li key={item.n} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                  {item.n}
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Work on each phase begins only after the corresponding payment is received.</p>
          <p>• Final source files and ownership are transferred after full payment.</p>
          <p>• Additional features or scope changes may incur extra charges.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
