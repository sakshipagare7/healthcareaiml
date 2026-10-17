'use client';

import React, { useState } from 'react';
import {
  HeartPulse,
  Brain,
  Droplets,
  Activity,
  Wind,
  AlertOctagon,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProtocolStep {
  number: number;
  title: string;
  action: string;
  details?: string;
  isCritical?: boolean;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  category: string;
  icon: any;
  severity: 'Immediate Emergency' | 'Urgent First-Aid';
  symptomSummary: string;
  timeWindow: string;
  steps: ProtocolStep[];
  contraindications: string[];
  paramedicNote: string;
}

const FIRST_AID_PROTOCOLS: EmergencyProtocol[] = [
  {
    id: 'heart_attack',
    name: 'Chest Pain & Suspected Heart Attack (Myocardial Infarction)',
    category: 'Cardiovascular',
    icon: HeartPulse,
    severity: 'Immediate Emergency',
    symptomSummary: 'Crushing chest tightness, pain radiating to left arm/jaw, diaphoresis (cold sweat), nausea',
    timeWindow: 'Golden Hour (Immediate Revascularization / PCI)',
    steps: [
      {
        number: 1,
        title: 'Activate Emergency Services (112)',
        action: 'Immediately call 112. Keep patient completely still in the "W" sitting position with knees bent and back supported.',
        details: 'Never permit the patient to walk or exert physical effort, which increases myocardial oxygen demand.',
        isCritical: true
      },
      {
        number: 2,
        title: 'Loosen Constricting Clothing',
        action: 'Unbutton tight collar, neckties, belts, and snug waistbands to facilitate unhindered thoracic expansion and ventilation.',
        isCritical: false
      },
      {
        number: 3,
        title: 'Administer Chewable Aspirin (If Non-Allergic)',
        action: 'Instruct patient to slowly chew and swallow a single 300 mg soluble or chewable Aspirin tablet.',
        details: 'Chewing accelerates platelet anti-aggregation by absorbing through buccal mucosa. DO NOT administer if known allergy or active gastrointestinal bleeding.',
        isCritical: true
      },
      {
        number: 4,
        title: 'Deploy Automated External Defibrillator (AED)',
        action: 'Locate nearest public AED. Keep defibrillator pads ready. If patient loses consciousness and stops breathing, initiate hands-only CPR immediately.',
        details: 'Compression rate: 100-120 compressions per minute at a depth of 5-6 cm in the center of the chest.',
        isCritical: true
      }
    ],
    contraindications: [
      'DO NOT allow patient to drive themselves to the hospital.',
      'DO NOT administer nitroglycerin if systolic blood pressure is below 90 mmHg or patient has taken PDE-5 inhibitors.',
      'DO NOT give large glasses of water or solid food.'
    ],
    paramedicNote: 'Target door-to-balloon time < 90 minutes. State suspected STEMI upon 112 dispatch.'
  },
  {
    id: 'stroke',
    name: 'Acute Stroke Protocol (FAST Algorithm)',
    category: 'Neurological',
    icon: Brain,
    severity: 'Immediate Emergency',
    symptomSummary: 'Sudden facial droop, one-sided arm weakness, slurred speech, acute visual disturbance, loss of balance',
    timeWindow: 'Critical Window < 4.5 Hours for IV Thrombolysis (tPA)',
    steps: [
      {
        number: 1,
        title: 'F - Face Drooping',
        action: 'Ask person to smile. Observe if one side of the mouth or face droops or is asymmetric.',
        details: 'Ask patient to show teeth or raise eyebrows.',
        isCritical: true
      },
      {
        number: 2,
        title: 'A - Arm Weakness',
        action: 'Ask person to raise both arms straight ahead with eyes closed for 10 seconds. Check if one arm drifts downward or cannot be lifted.',
        isCritical: true
      },
      {
        number: 3,
        title: 'S - Speech Difficulty',
        action: 'Ask person to repeat a simple sentence (e.g. "The grass is green"). Listen for slurred, garbled, or absent speech.',
        isCritical: true
      },
      {
        number: 4,
        title: 'T - Time to Call 112 & Record Symptom Onset',
        action: 'Immediately call 112. Note and write down the EXACT minute the symptoms were first observed by witnesses.',
        details: 'The precise timestamp determines whether tissue plasminogen activator (tPA) or mechanical thrombectomy can be administered.',
        isCritical: true
      }
    ],
    contraindications: [
      'ABSOLUTELY NO ASPIRIN: In hemorrhagic strokes, aspirin causes fatal intracranial bleeding.',
      'DO NOT give food, drinks, or oral medications (high risk of choking/aspiration from dysphagia).',
      'DO NOT allow patient to sleep or wait to see if symptoms resolve.'
    ],
    paramedicNote: 'Request transport specifically to a comprehensive stroke-ready hospital with 24x7 CT/MRI.'
  },
  {
    id: 'hemorrhage',
    name: 'Severe Uncontrolled Hemorrhage & Bleeding',
    category: 'Trauma',
    icon: Droplets,
    severity: 'Immediate Emergency',
    symptomSummary: 'Pulsatile arterial spurting, large pooling of dark red blood, soakage of multiple dressings',
    timeWindow: 'Minutes to Exsanguination (Immediate Hemostasis Required)',
    steps: [
      {
        number: 1,
        title: 'Direct Manual Compression',
        action: 'Apply firm, continuous direct pressure directly over the bleeding vessel using sterile gauze, trauma pad, or clean cloth.',
        details: 'Do not remove blood-soaked dressings; layer fresh dressings directly on top.',
        isCritical: true
      },
      {
        number: 2,
        title: 'Elevate Injured Extremity',
        action: 'Elevate the bleeding limb above the level of the patient\'s heart if no musculoskeletal fracture is suspected.',
        isCritical: false
      },
      {
        number: 3,
        title: 'Tourniquet Application (For Severe Limb Trauma)',
        action: 'If bleeding from an arm or leg cannot be controlled with direct pressure, apply an approved windlass tourniquet 2 to 3 inches above the wound (never over a joint).',
        details: 'Tighten until the arterial bleeding completely stops. Write the exact application time on the patient\'s forehead or tourniquet band.',
        isCritical: true
      },
      {
        number: 4,
        title: 'Prevent Hypothermic Shock',
        action: 'Cover patient with a warm blanket to maintain core temperature. Loss of blood rapidly induces hypothermia which halts coagulation.',
        isCritical: true
      }
    ],
    contraindications: [
      'DO NOT loosen or remove an applied tourniquet once placed (must only be removed in surgery).',
      'DO NOT probe deeply into open puncture wounds with fingers or tweezers.'
    ],
    paramedicNote: 'Estimate blood loss volume and communicate application time of tourniquet to trauma resuscitation team.'
  },
  {
    id: 'syncope',
    name: 'Syncope & Sudden Unconsciousness',
    category: 'Acute Consciousness',
    icon: Activity,
    severity: 'Urgent First-Aid',
    symptomSummary: 'Sudden collapse, loss of postural tone, pallor, transient unresponsiveness',
    timeWindow: 'Immediate Airway Protection & Neurological Assessment',
    steps: [
      {
        number: 1,
        title: 'Assess Airway & Normal Breathing',
        action: 'Tilt head and lift chin gently to open airway. Check for chest movement and air expulsion for 10 seconds.',
        details: 'If patient is NOT breathing or making only agonal gasps, begin CPR immediately.',
        isCritical: true
      },
      {
        number: 2,
        title: 'Position in Lateral Recovery Position',
        action: 'If breathing normally, roll patient onto their side in the recovery position to prevent the tongue from blocking the airway and prevent aspiration of saliva or vomitus.',
        isCritical: true
      },
      {
        number: 3,
        title: 'Elevate Lower Extremities 12 Inches (30 cm)',
        action: 'If patient remains supine without head injury, elevate legs approximately 30 cm to optimize cerebral perfusion.',
        isCritical: false
      },
      {
        number: 4,
        title: 'Monitor Carotid Pulse & Capillary Refill',
        action: 'Continually monitor responsiveness and breathing. If consciousness is not regained within 60 seconds, dispatch 112 immediately.',
        isCritical: true
      }
    ],
    contraindications: [
      'DO NOT throw cold water or slap the patient\'s face.',
      'DO NOT attempt to force the patient to stand or sit up prematurely.',
      'DO NOT put any object or finger into the mouth.'
    ],
    paramedicNote: 'Differentiate between vasovagal syncope, cardiac dysrhythmia, and generalized seizure post-ictal state.'
  },
  {
    id: 'respiratory',
    name: 'Severe Respiratory Distress & Asthma Attack',
    category: 'Pulmonary',
    icon: Wind,
    severity: 'Immediate Emergency',
    symptomSummary: 'Inability to speak complete sentences without gasping, intercostal retractions, audible wheezing, cyanosis',
    timeWindow: 'Urgent Bronchodilation & Oxygenation Required',
    steps: [
      {
        number: 1,
        title: 'Upright Orthopneic Posture',
        action: 'Seat the patient upright, leaning slightly forward with arms resting on their knees or a table (tripod position) to maximize lung volume.',
        isCritical: false
      },
      {
        number: 2,
        title: 'Administer Rescue Bronchodilator Inhaler',
        action: 'Assist the patient with their prescribed Salbutamol / Albuterol rescue inhaler. Administer 4 separate puffs with 4 quiet breaths between each puff, using a spacer if available.',
        details: 'If no improvement after 4 minutes, give 4 more puffs and dial 112.',
        isCritical: true
      },
      {
        number: 3,
        title: 'Encourage Pursed-Lip Breathing',
        action: 'Instruct patient to inhale slowly through the nose and exhale gently through pursed lips (like blowing out a candle) to prevent alveolar collapse.',
        isCritical: false
      },
      {
        number: 4,
        title: 'Call 112 if Cyanosis or Exhaustion Occurs',
        action: 'If lips turn bluish-gray, speech becomes monosyllabic, or patient becomes drowsy, dial 112 immediately as respiratory arrest is imminent.',
        isCritical: true
      }
    ],
    contraindications: [
      'DO NOT force patient to lie flat on their back.',
      'DO NOT crowd the patient; maintain open space and circulating ventilation.'
    ],
    paramedicNote: 'Check for silent chest (absence of wheezing indicating near-total airway occlusion).'
  },
  {
    id: 'choking',
    name: 'Choking & Foreign Body Airway Obstruction',
    category: 'Airway Emergency',
    icon: AlertOctagon,
    severity: 'Immediate Emergency',
    symptomSummary: 'Universal choking sign (hands clutching throat), inability to speak, cough, or breathe, facial congestion',
    timeWindow: 'Seconds to Hypoxic Brain Injury (Immediate Clearance)',
    steps: [
      {
        number: 1,
        title: 'Encourage Spontaneous Coughing',
        action: 'If patient can cough forcefully or speak, encourage them to continue coughing to expel the foreign body naturally.',
        details: 'Do not interfere if the cough is effective.',
        isCritical: false
      },
      {
        number: 2,
        title: '5 Firm Back Blows',
        action: 'If airway is completely obstructed (silent, unable to cough): Stand slightly behind, support their chest with one hand, lean them forward, and deliver 5 sharp back blows between the shoulder blades using the heel of your hand.',
        isCritical: true
      },
      {
        number: 3,
        title: '5 Abdominal Thrusts (Heimlich Maneuver)',
        action: 'If back blows fail, stand behind, place your fist just above their navel, grasp with other hand, and pull inward and upward sharply 5 times.',
        details: 'For pregnant individuals or infants, replace with chest thrusts.',
        isCritical: true
      },
      {
        number: 4,
        title: 'Repeat Cycle or Begin CPR if Unresponsive',
        action: 'Alternate 5 back blows and 5 abdominal thrusts until object is expelled. If patient falls unconscious, lower gently to floor and begin chest compressions immediately.',
        isCritical: true
      }
    ],
    contraindications: [
      'DO NOT perform blind finger sweeps in the oral cavity (can push foreign body deeper into larynx).',
      'DO NOT slap on the back while the person is standing upright (gravity may push object downward).'
    ],
    paramedicNote: 'Keep Magill forceps and suction ready on arrival.'
  }
];

export default function FirstAidProtocols() {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('heart_attack');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    heart_attack: true
  });

  const activeProtocol = FIRST_AID_PROTOCOLS.find((p) => p.id === selectedProtocolId) || FIRST_AID_PROTOCOLS[0];

  const filteredProtocols = FIRST_AID_PROTOCOLS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.symptomSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              Step-by-Step Offline Clinical First-Aid Protocols
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-based acute action algorithms for bystanders and first responders while awaiting 112
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Offline Ready</span>
          </span>
        </div>
      </div>

      {/* Protocol Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 pb-2">
        {filteredProtocols.map((proto) => {
          const Icon = proto.icon;
          const isSelected = selectedProtocolId === proto.id;
          return (
            <button
              key={proto.id}
              onClick={() => setSelectedProtocolId(proto.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-red-600'}`} />
              <span>{proto.name.split('(')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Active Protocol Display Card */}
      <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
                {activeProtocol.severity}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{activeProtocol.category}</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">{activeProtocol.name}</h4>
            <p className="text-xs text-slate-600 mt-1">
              <strong>Identifying Signs:</strong> {activeProtocol.symptomSummary}
            </p>
          </div>

          <div className="shrink-0 bg-red-50 border border-red-200 p-2.5 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-red-700 block">Critical Time Window</span>
            <span className="text-xs font-extrabold text-red-900">{activeProtocol.timeWindow}</span>
          </div>
        </div>

        {/* Step-by-Step Action List */}
        <div className="mt-5 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mandatory Action Sequence:
          </h5>
          {activeProtocol.steps.map((st) => (
            <div
              key={st.number}
              className={`p-3.5 rounded-xl border transition-all ${
                st.isCritical
                  ? 'bg-white border-red-200 shadow-xs'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    st.isCritical ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {st.number}
                </div>
                <div>
                  <h6 className="text-xs font-bold text-slate-900">{st.title}</h6>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{st.action}</p>
                  {st.details && (
                    <p className="text-[11px] text-slate-500 mt-1 italic bg-slate-50 p-1.5 rounded-md">
                      {st.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contraindications Warning Box */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Strict Clinical Contraindications (What NOT to Do)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
            {activeProtocol.contraindications.map((ci, idx) => (
              <li key={idx}>{ci}</li>
            ))}
          </ul>
        </div>

        {/* Paramedic Handoff Note */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span>
            <strong>First-Responder Handoff:</strong> {activeProtocol.paramedicNote}
          </span>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-xs transition-all"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Dial 112</span>
          </a>
        </div>
      </div>
    </div>
  );
}
