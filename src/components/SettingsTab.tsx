import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  MapPin, 
  Languages, 
  KeyRound, 
  CheckSquare, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

export function SettingsTab() {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [hospitalName, setHospitalName] = useState('Nithin Memorial Health-System');
  const [hospitalAddress, setHospitalAddress] = useState('456 Medical Avenue, Boston');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 911-3000');
  
  const [permissions, setPermissions] = useState([
    { role: 'Admin', module: 'System Shell / Backups', permission: 'Full Read/Write Access' },
    { role: 'Doctor', module: 'Patient Diagnoses Logs', permission: 'Write-Access for Own Records' },
    { role: 'Receptionist', module: 'Billing System Book', permission: 'Issue & Sign Receipts Only' },
    { role: 'Patient Proxy', module: 'Web Profile Portals', permission: 'Read-Only Lab PDF Reports' }
  ]);

  // Small dictionary to demonstrate language switcher working
  const dict = {
    en: {
      profile: "Hospital Information System",
      langTitle: "Interface Translation Configuration",
      permissionsTitle: "Staff User Access Allocator",
      secretsTitle: "Google AI Studio Developer Secrets",
      save: "Apply Parameters",
      desc: "Specify hospital registry files, language keys, and cryptographic variables."
    },
    hi: {
      profile: "अस्पताल सूचना प्रणाली",
      langTitle: "अनुवाद भाषा विन्यास",
      permissionsTitle: "कर्मचारी भूमिका विशेषाधिकार",
      secretsTitle: "गूगल एआई स्टूडियो डेवलपर कुंजी",
      save: "पैरामीटर लागू करें",
      desc: "अस्पताल पंजीकरण फाइलें, भाषा कुंजी और क्रिप्टोग्राफ़िक चर निर्दिष्ट करें।"
    },
    kn: {
      profile: "ಆಸ್ಪತ್ರೆ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ",
      langTitle: "ಭಾಷಾ ಅನುವಾದ ಸೆಟ್ಟಿಂಗ್ಸ್",
      permissionsTitle: "ಸಿಬ್ಬಂದಿ ಪ್ರವೇಶ ನಿಯಂತ್ರಣಗಳು",
      secretsTitle: "ಗೂಗಲ್ ಎಐ ಸ್ಟುಡಿಯೋ ಕೀಗಳು",
      save: "ಉಳಿಸಿ",
      desc: "ಆಸ್ಪತ್ರೆ ನೋಂದಣಿ ವಿವರಗಳು, ಭಾಷೆ ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಡೆವಲಪರ್ ಕೀಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ."
    }
  };

  const activeDict = dict[selectedLanguage];

  const handleApply = () => {
    alert(`Configuration updated successfully! Language shifted to "${selectedLanguage === 'en' ? 'English' : selectedLanguage === 'hi' ? 'Hindi' : 'Kannada'}".`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-tab-module">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-805 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>{activeDict.profile}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeDict.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="settings-split-grid">
        
        {/* Left Col - Hospital Info & Languages Switcher */}
        <div className="space-y-6">
          
          {/* Hospital general card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Building className="h-4 w-4" />
              <span>Core Medical Registry Metadata</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Health System Name Identifier</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Administrative Location Address</label>
                <input
                  type="text"
                  value={hospitalAddress}
                  onChange={e => setHospitalAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Trauma Hotline</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Integration translations selection */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Languages className="h-4 w-4" />
              <span>{activeDict.langTitle}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2" id="settings-lang-selectors">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${selectedLanguage === 'en' ? 'border-blue-600 bg-blue-50/20 text-blue-700' : 'hover:bg-slate-50'}`}
              >
                <span>🌍 English</span>
                <span className="text-[9px] text-slate-400 mt-0.5">United States</span>
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${selectedLanguage === 'hi' ? 'border-blue-600 bg-blue-50/20 text-blue-700' : 'hover:bg-slate-50'}`}
              >
                <span>हिन्दी (Hindi)</span>
                <span className="text-[9px] text-slate-400 mt-0.5">भारत</span>
              </button>
              <button
                onClick={() => setSelectedLanguage('kn')}
                className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${selectedLanguage === 'kn' ? 'border-blue-600 bg-blue-50/20 text-blue-700' : 'hover:bg-slate-50'}`}
              >
                <span>ಕನ್ನಡ (Kannada)</span>
                <span className="text-[9px] text-slate-400 mt-0.5">ಕರ್ನಾಟಕ</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal font-semibold">Toggling these indices helps test clinical UI compatibility against regional Indian and global client interfaces dynamically.</p>
          </div>

        </div>

        {/* Right Col - Permissions & Secrets */}
        <div className="space-y-6">

          {/* Secure credentials */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-205 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <KeyRound className="h-4 w-4" />
              <span>{activeDict.secretsTitle}</span>
            </h3>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 text-blue-900 dark:text-blue-200 p-4 rounded-lg space-y-2">
              <p className="text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>API Secrets Authorization Status:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Nithin's Hospital Management App incorporates full-stack proxy routing to query raw Gemini models. To test live responses:
              </p>
              <ol className="text-[11px] pl-4 list-decimal space-y-1 font-semibold text-slate-600 dark:text-slate-300">
                <li>Go to the **Settings &rarr; Secrets** panel in Google AI Studio interface.</li>
                <li>Add a new secret key matching label: <code className="bg-white px-1.5 py-0.5 rounded border text-red-600 font-mono font-bold">GEMINI_API_KEY</code></li>
                <li>Re-enter your sandbox to ask clinical queries dynamically!</li>
              </ol>
            </div>
          </div>

          {/* Privilege allocations list */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <CheckSquare className="h-4 w-4" />
              <span>{activeDict.permissionsTitle}</span>
            </h3>

            <div className="divide-y divide-slate-100" id="settings-pills-list">
              {permissions.map((perm, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">{perm.module}</span>
                    <span className="text-[11px] text-slate-400">Target Role: <strong className="text-slate-600 dark:text-slate-300 uppercase">{perm.role}</strong></span>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-900 border text-slate-605 px-2 py-0.5 rounded text-[11px] font-mono">
                    {perm.permission}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Button to save settings */}
      <div className="pt-4 border-t flex justify-end">
        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition select-none flex items-center space-x-1.5"
          id="btn-apply-settings"
        >
          <Building className="h-4 w-4" />
          <span>{activeDict.save}</span>
        </button>
      </div>

    </div>
  );
}
