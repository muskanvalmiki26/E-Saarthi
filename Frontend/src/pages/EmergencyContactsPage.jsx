import React, { useState } from 'react';
import { PhoneCall, UserPlus, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import ContactCard from '../components/sos/ContactCard';
import apiService from '../api/apiService';

export const EmergencyContactsPage = () => {
  const { contacts, setContacts } = useSafety();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Parent');

  const handleAddContact = async (e) => {
    e.preventDefault();

    if (!name || !phone) return;

    try {
      await apiService.addEmergencyContact({
        name,
        phone,
        relation: relationship
      });

      const updatedContacts = await apiService.getEmergencyContacts();
      setContacts(updatedContacts);

      setName('');
      setPhone('');
      setRelationship('Parent');
      setShowAddModal(false);

      alert('Emergency contact saved successfully!');
    } catch (err) {
      console.error('Failed to save contact:', err);
      alert(err.response?.data?.detail || 'Failed to save emergency contact.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Emergency Contacts (Guardians)
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {contacts.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contacts receive automatic SMS & WhatsApp alerts with your live GPS location when SOS is activated.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Add Emergency Guardian</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter details of a family member or trusted friend.
            </p>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Guardian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsPage;
