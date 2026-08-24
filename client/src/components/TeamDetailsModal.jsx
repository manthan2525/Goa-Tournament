import React from 'react';
import { X, Users, User, Mail, Phone, MessageSquare, ShieldCheck, CreditCard } from 'lucide-react';

const formatWhatsAppUrl = (phoneStr) => {
  if (!phoneStr) return '#';
  const clean = String(phoneStr).replace(/\D/g, '');
  if (!clean) return '#';
  const formatted = clean.length === 10 ? `91${clean}` : clean;
  return `https://wa.me/${formatted}`;
};

const TeamDetailsModal = ({ registration, onClose, onReviewPayment, onReviewAadhaar }) => {
  if (!registration) return null;

  const email = registration.contactEmail || registration.user?.email || 'N/A';
  const phone = registration.contactPhone || registration.user?.phone || 'N/A';
  const whatsapp = registration.contactWhatsapp || registration.user?.whatsapp || phone;
  const isSamePhoneWhatsapp = phone !== 'N/A' && (phone === whatsapp || whatsapp === 'N/A');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col my-auto rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-5 sm:p-7 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Registered Squad
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(registration.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-white mt-1">{registration.teamName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Captain & Contact Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Captain: {registration.captainName}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                registration.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                registration.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' : 'bg-yellow-500/15 text-yellow-400'
              }`}>
                {registration.status}
              </span>
            </div>

            {/* Contact Details & Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">Email Address</span>
                <span className="text-white font-medium break-all">{email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                  {isSamePhoneWhatsapp ? 'Phone / WhatsApp' : 'Phone Number'}
                </span>
                <span className="text-white font-mono font-medium">{phone}</span>
              </div>

              {!isSamePhoneWhatsapp && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">WhatsApp Number</span>
                  <span className="text-emerald-400 font-mono font-medium">{whatsapp}</span>
                </div>
              )}
            </div>

            {/* Interactive Direct Contact Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              {email !== 'N/A' && (
                <a
                  href={`mailto:${email}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email</span>
                </a>
              )}
              {phone !== 'N/A' && (
                <a
                  href={`tel:${phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
              )}
              {(whatsapp !== 'N/A' || phone !== 'N/A') && (
                <a
                  href={formatWhatsAppUrl(whatsapp !== 'N/A' ? whatsapp : phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Squad Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Registered Squad Roster ({registration.playersList?.length || 0} Players)
              </span>
            </div>
            {registration.playersList && registration.playersList.length > 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-slate-900/90 p-2.5 font-bold text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Player Name</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-2 text-right">Jersey</div>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
                  {registration.playersList.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 p-2.5 items-center text-slate-200">
                      <div className="col-span-1 font-mono text-slate-500">{i + 1}</div>
                      <div className="col-span-6 font-semibold text-white truncate">{p.name}</div>
                      <div className="col-span-3 text-slate-400">{p.role || 'Player'}</div>
                      <div className="col-span-2 text-right font-mono font-bold text-emerald-400">
                        {p.jerseyNumber ? `#${p.jerseyNumber}` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                No roster list provided during registration.
              </p>
            )}
          </div>

          {/* Payment & Verification Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Payment Status</span>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  registration.paymentStatus === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                  registration.paymentStatus === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {registration.paymentStatus || 'PENDING'}
                </span>
                {onReviewPayment && registration.payment && (
                  <button
                    onClick={() => {
                      onClose();
                      onReviewPayment(registration);
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Review Payment
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Aadhaar Status</span>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  registration.aadhaarVerificationStatus === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                  registration.aadhaarVerificationStatus === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' :
                  registration.aadhaarVerificationStatus === 'NOT_REQUIRED' ? 'bg-slate-800 text-slate-400' : 'bg-teal-500/15 text-teal-400'
                }`}>
                  {registration.aadhaarVerificationStatus || 'NOT_REQUIRED'}
                </span>
                {onReviewAadhaar && registration.aadhaarDocument && (
                  <button
                    onClick={() => {
                      onClose();
                      onReviewAadhaar(registration);
                    }}
                    className="text-[11px] font-bold text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Review ID
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal;
