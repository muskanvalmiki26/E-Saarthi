import React from 'react';
import { PhoneCall, ShieldCheck, MessageSquare, Trash2 } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import apiService from '../../api/apiService';

export const ContactCard = ({ contact }) => {
  const { setContacts } = useSafety();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${contact.name}?`
    );

    if (!confirmed) return;

    try {
      await apiService.deleteEmergencyContact(contact.id);

      const updatedContacts = await apiService.getEmergencyContacts();
      setContacts(updatedContacts);

      alert('Emergency contact deleted successfully!');
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert(err.response?.data?.detail || 'Failed to delete contact.');
    }
  };

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
          {contact.name.charAt(0)}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              {contact.name}
            </h4>

            {contact.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
            )}

            {contact.isPrimary && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                Primary
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {contact.phone} • {contact.relationship || contact.relation}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=Emergency%20Alert:%20I%20am%20using%20E-Saarthi%20SOS`}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          title="Send WhatsApp SOS message"
        >
          <MessageSquare className="w-4 h-4" />
        </a>

        <a
          href={`tel:${contact.phone}`}
          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Direct Phone Call"
        >
          <PhoneCall className="w-4 h-4" />
        </a>

        <button
          onClick={handleDelete}
          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          title="Delete Contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
