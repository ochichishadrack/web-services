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

  const {
    currency: localCurrency,
    convert,
    format,
    loading: currencyLoading,
  } = useLocalCurrency();

  // Only KES and USD are supported by this Paystack account
  const payCurrency: 'KES' | 'USD' = localCurrency === 'KES' ? 'KES' : 'USD';
  const isKes = payCurrency === 'KES';
  const showLocalEstimate = !currencyLoading && localCurrency !== payCurrency;
  const showUnsupportedNotice = !currencyLoading && localCurrency !== 'KES' && localCurrency !== 'USD';

  const extrasTotalUsd = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const backendTotalUsd = selectedPackage.price + extrasTotalUsd; // always USD from DB

  const { phases, payable, discount } = calculatePhases(backendTotalUsd, option);
  const discountAmountUsd = Math.round(backendTotalUsd * discount);

  // Convert USD → display currency (KES or USD)
  const toDisplay = (usdAmount: number) =>
    isKes ? convert(usdAmount) : usdAmount;

  const formatMoney = (usdAmount: number) => {
    const amount = toDisplay(usdAmount);
    return `${payCurrency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePay = async (): Promise<void> => {
    if (!accepted) {
      alert('Accept terms first');
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

      // Always send the USD amount. Backend converts to KES when currency === "KES"
      const payload = {
        service_id: orderPayload.service_id,
        package_id: orderPayload.package_id,
        buyer_id: customer.public_id,
        extras_ids: orderPayload.extras_ids,
        phase: option,
        payment_type: 'service',
        amount: payable,               // USD major units
        currency: payCurrency,         // "KES" or "USD"
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
        err instanceof Error ? err.message : 'Failed to initialize payment. Check console.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6 sm:py-8 flex justify-center transition-colors">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-colors">
        {/* HEADER */}
        <div className="bg-black dark:bg-white text-white dark:text-black p-5 sm:p-6 text-center transition-colors">
          <h1 className="text-xl sm:text-2xl font-bold">Contract Payment Plan</h1>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* KES NOTICE */}
          {isKes && !currencyLoading && (
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-3.5 text-xs sm:text-sm text-blue-800 dark:text-blue-300">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Amounts below are shown and charged in Kenyan Shillings (KES).</span>
            </div>
          )}

          {/* UNSUPPORTED LOCAL CURRENCY NOTICE */}
          {showUnsupportedNotice && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    USD payments only for your region
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    Online payments are currently available only in <strong>USD</strong> for
                    customers in your country. All amounts below will be charged in US Dollars.
                    An approximate conversion into your local currency is shown for reference.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white/70 dark:bg-gray-900/40 border border-amber-100 dark:border-amber-800/40 px-3.5 py-3">
                <p className="text-[11px] uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80 mb-1">
                  Approximate local equivalent
                </p>
                <p className="text-base sm:text-lg font-semibold text-amber-950 dark:text-amber-100">
                  {format(backendTotalUsd)}
                </p>
                <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70 mt-1">
                  Based on current exchange rates · Final charge will be in USD
                </p>
              </div>

              <div className="pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-2.5">
                  Need assistance with payment or currency options?
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href="https://wa.me/254700000000" // ← replace with your real number
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-medium transition shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href="mailto:support@yourdomain.com" // ← replace with your real email
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 text-amber-900 dark:text-amber-200 text-sm font-medium hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Service</p>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                  {selectedPackage.name}
                </h2>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Contract Value</p>
                <div className="mt-1 inline-block bg-gray-900 dark:bg-gray-100 text-white dark:text-black px-3 py-2 rounded-xl text-sm font-semibold">
                  {formatMoney(backendTotalUsd)}
                  {showLocalEstimate && (
                    <span className="block text-[11px] font-normal opacity-70 mt-0.5">
                      ≈ {format(backendTotalUsd)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PHASES */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Project Milestones
            </h2>

            <PhaseBox
              title="Phase 1"
              percent="20%"
              amountLabel={formatMoney(phases.phase1.amount)}
              localEstimate={showLocalEstimate ? format(phases.phase1.amount) : null}
              description="Covers onboarding, planning, design direction, and technical project setup."
            />

            <PhaseBox
              title="Phase 2"
              percent="60%"
              amountLabel={formatMoney(phases.phase2.amount)}
              localEstimate={showLocalEstimate ? format(phases.phase2.amount) : null}
              description="Execution of core design, development, integrations, and system functionality."
            />

            <PhaseBox
              title="Phase 3"
              percent="20%"
              amountLabel={formatMoney(phases.phase3.amount)}
              localEstimate={showLocalEstimate ? format(phases.phase3.amount) : null}
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
          <div className="w-full mt-4 md:mt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount Payable</span>
              <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-gray-100 text-right">
                {formatMoney(payable)}
                {showLocalEstimate && (
                  <span className="block text-xs font-normal text-gray-400 dark:text-gray-500">
                    ≈ {format(payable)}
                  </span>
                )}
              </span>
            </div>

            {discountAmountUsd > 0 && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-green-500">Discount Applied</span>
                <span className="text-green-500 font-semibold">
                  {formatMoney(discountAmountUsd)}
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
  amountLabel: string;
  localEstimate: string | null;
  description: string;
}

function PhaseBox({
  title,
  percent,
  amountLabel,
  localEstimate,
  description,
}: PhaseBoxProps): JSX.Element {
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
        {amountLabel}
        {localEstimate && (
          <span className="block text-xs font-normal text-gray-400 dark:text-gray-500">
            ≈ {localEstimate}
          </span>
        )}
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
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Project Initiation — 20%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Covers project scoping, requirements gathering, and kickoff.
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Design & Development — 60%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Covers UI/UX design, development, integrations, and testing.
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Final Delivery & Launch — 20%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Payable upon successful deployment, handover, and client approval.
                </p>
              </div>
            </li>
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