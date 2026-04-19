'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { submitSafetyPlan, SafetyPlanData, ContactInfo } from '@/services/clinical.service';

export default function SafetyPlanPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Arrays of strings
    const [warningSigns, setWarningSigns] = useState<string[]>(['']);
    const [internalCoping, setInternalCoping] = useState<string[]>(['']);
    const [socialDistractors, setSocialDistractors] = useState<string[]>(['']);
    const [environmentSteps, setEnvironmentSteps] = useState<string[]>(['']);

    // Arrays of objects
    const [supportContacts, setSupportContacts] = useState<ContactInfo[]>([{ name: '', phone: '' }]);
    const [professionalContacts, setProfessionalContacts] = useState<ContactInfo[]>([{ name: '', phone: '', description: '' }]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user && !user.has_consented) {
            router.push('/consent');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleStringChange = (index: number, value: string, setter: any, list: string[]) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };

    const addStringItem = (setter: any, list: string[]) => {
        setter([...list, '']);
    };

    const removeStringItem = (index: number, setter: any, list: string[]) => {
        if (list.length > 1) {
            const newList = [...list];
            newList.splice(index, 1);
            setter(newList);
        }
    };

    const handleContactChange = (index: number, field: keyof ContactInfo, value: string, setter: any, list: ContactInfo[]) => {
        const newList = [...list];
        newList[index] = { ...newList[index], [field]: value };
        setter(newList);
    };

    const addContactItem = (setter: any, list: ContactInfo[], isProfessional = false) => {
        setter([...list, isProfessional ? { name: '', phone: '', description: '' } : { name: '', phone: '' }]);
    };

    const removeContactItem = (index: number, setter: any, list: ContactInfo[]) => {
        if (list.length > 1) {
            const newList = [...list];
            newList.splice(index, 1);
            setter(newList);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            
            const filterStrings = (arr: string[]) => arr.filter(s => s.trim() !== '');
            const filterContacts = (arr: ContactInfo[]) => arr.filter(c => c.name.trim() !== '' || c.phone.trim() !== '');

            const payload: SafetyPlanData = {
                warning_signs: filterStrings(warningSigns),
                internal_coping: filterStrings(internalCoping),
                social_distractors: filterStrings(socialDistractors),
                support_contacts: filterContacts(supportContacts),
                professional_contacts: filterContacts(professionalContacts),
                environment_safety_steps: filterStrings(environmentSteps)
            };

            await submitSafetyPlan(payload);
            alert('Safety Plan saved successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error saving safety plan:', error);
            alert('Failed to save safety plan.');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-primary-600 font-medium hover:text-primary-700">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </header>
            
            <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Stanley-Brown Safety Plan</h1>
                            <p className="text-slate-600">A step-by-step guide to help you manage distress and stay safe.</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8">
                            <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: ((step / 6) * 100) + '%' }}></div>
                        </div>

                        {/* Step 1: Warning Signs */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 1: Warning Signs</h2>
                                <p className="text-sm text-slate-600">What are your personal warning signs that a crisis may be developing? (Thoughts, images, mood, situation, behavior)</p>
                                
                                <div className="space-y-3">
                                    {warningSigns.map((val, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                value={val}
                                                onChange={(e) => handleStringChange(idx, e.target.value, setWarningSigns, warningSigns)}
                                                placeholder="e.g., Feeling hopeless, restless sleep, withdrawing from friends"
                                            />
                                            {warningSigns.length > 1 && (
                                                <button onClick={() => removeStringItem(idx, setWarningSigns, warningSigns)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addStringItem(setWarningSigns, warningSigns)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another sign</button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Internal Coping */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 2: Internal Coping Strategies</h2>
                                <p className="text-sm text-slate-600">Things I can do to take my mind off my problems without contacting another person.</p>
                                
                                <div className="space-y-3">
                                    {internalCoping.map((val, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                value={val}
                                                onChange={(e) => handleStringChange(idx, e.target.value, setInternalCoping, internalCoping)}
                                                placeholder="e.g., Going for a 30-minute walk, listening to calming music"
                                            />
                                            {internalCoping.length > 1 && (
                                                <button onClick={() => removeStringItem(idx, setInternalCoping, internalCoping)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addStringItem(setInternalCoping, internalCoping)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another strategy</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Social Distractions */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 3: Social Settings that Provide Distraction</h2>
                                <p className="text-sm text-slate-600">People and social settings that provide distraction (these are just for distraction, not asking them for help yet).</p>
                                
                                <div className="space-y-3">
                                    {socialDistractors.map((val, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                value={val}
                                                onChange={(e) => handleStringChange(idx, e.target.value, setSocialDistractors, socialDistractors)}
                                                placeholder="e.g., Going to the local coffee shop, visiting the park"
                                            />
                                            {socialDistractors.length > 1 && (
                                                <button onClick={() => removeStringItem(idx, setSocialDistractors, socialDistractors)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addStringItem(setSocialDistractors, socialDistractors)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another distraction</button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Support Contacts */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 4: People Whom I Can Ask For Help</h2>
                                <p className="text-sm text-slate-600">Family members, friends, or trusted individuals you can share your distress with.</p>
                                
                                <div className="space-y-4">
                                    {supportContacts.map((contact, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                    value={contact.name}
                                                    onChange={(e) => handleContactChange(idx, 'name', e.target.value, setSupportContacts, supportContacts)}
                                                    placeholder="Name (e.g., Jane Doe, Sister)"
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                    value={contact.phone}
                                                    onChange={(e) => handleContactChange(idx, 'phone', e.target.value, setSupportContacts, supportContacts)}
                                                    placeholder="Phone Number/Contact Method"
                                                />
                                            </div>
                                            {supportContacts.length > 1 && (
                                                <button onClick={() => removeContactItem(idx, setSupportContacts, supportContacts)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg self-start sm:self-center">Remove</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addContactItem(setSupportContacts, supportContacts, false)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another person</button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Professionals */}
                        {step === 5 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 5: Professionals or Agencies I Can Contact Durante a Crisis</h2>
                                <p className="text-sm text-slate-600">Clinicians, therapists, local emergency rooms, or 24/7 crisis hotlines.</p>
                                
                                <div className="space-y-4">
                                    {professionalContacts.map((contact, idx) => (
                                        <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                    value={contact.name}
                                                    onChange={(e) => handleContactChange(idx, 'name', e.target.value, setProfessionalContacts, professionalContacts)}
                                                    placeholder="Name (e.g., Dr. Smith, Crisis Hotline)"
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                    value={contact.phone}
                                                    onChange={(e) => handleContactChange(idx, 'phone', e.target.value, setProfessionalContacts, professionalContacts)}
                                                    placeholder="Phone Number (e.g., 988)"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                value={contact.description || ''}
                                                onChange={(e) => handleContactChange(idx, 'description', e.target.value, setProfessionalContacts, professionalContacts)}
                                                placeholder="Location / Extra Details (Optional)"
                                            />
                                            
                                            {professionalContacts.length > 1 && (
                                                <button onClick={() => removeContactItem(idx, setProfessionalContacts, professionalContacts)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg self-start text-sm mt-1">Remove Contact</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addContactItem(setProfessionalContacts, professionalContacts, true)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another professional</button>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Environment */}
                        {step === 6 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 6: Making the Environment Safe</h2>
                                <p className="text-sm text-slate-600">What specific steps can you take to remove lethal means or make your environment safer right now?</p>
                                
                                <div className="space-y-3">
                                    {environmentSteps.map((val, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                                value={val}
                                                onChange={(e) => handleStringChange(idx, e.target.value, setEnvironmentSteps, environmentSteps)}
                                                placeholder="e.g., Ask my partner to lock up medications"
                                            />
                                            {environmentSteps.length > 1 && (
                                                <button onClick={() => removeStringItem(idx, setEnvironmentSteps, environmentSteps)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addStringItem(setEnvironmentSteps, environmentSteps)} className="text-primary-600 font-medium text-sm hover:underline">+ Add another step</button>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
                            <button
                                onClick={() => setStep(step - 1)}
                                disabled={step === 1}
                                className={'px-6 py-3 rounded-lg font-medium transition ' + (step === 1 ? 'opacity-0 cursor-default' : 'text-slate-600 bg-slate-100 hover:bg-slate-200')}
                            >
                                Previous
                            </button>
                            
                            {step < 6 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-sm"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? 'Saving Plan...' : 'Complete Safety Plan'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
