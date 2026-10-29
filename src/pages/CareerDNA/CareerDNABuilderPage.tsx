import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CareerDNA, CareerDNAPreferences } from '../../types';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export const CareerDNABuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { careerDNA, updateCareerDNA, addHistoryItem, user } = useApp();

  const [step, setStep] = useState<number>(3); // Default on Step 3 for quick interactive access, or start at 1
  const [targetRole, setTargetRole] = useState(careerDNA.targetRole || 'Backend Developer');
  const [experience, setExperience] = useState(careerDNA.experience || 'Fresher');
  const [priorities, setPriorities] = useState<CareerDNAPreferences>({ ...careerDNA.priorities });
  const [workStyle, setWorkStyle] = useState(careerDNA.workStyle || 'Hybrid');
  const [preferredLocation, setPreferredLocation] = useState(careerDNA.preferredLocation || 'Bangalore, India');
  const [skills, setSkills] = useState<string[]>([...careerDNA.skills]);

  const roles = [
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'AI / ML',
    'Data Science',
    'Cloud',
    'Cybersecurity',
    'Other',
  ];

  const experienceLevels = ['Student', 'Fresher', '1-2 years', '3+ years'];
  const workStyles = ['Remote', 'Hybrid', 'On-site'];
  const availableSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'Cloud'];

  const handleSliderChange = (key: keyof CareerDNAPreferences, val: number) => {
    setPriorities((prev) => ({ ...prev, [key]: val }));
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFinalSubmit = async () => {
    const updated: CareerDNA = {
      name: user?.name || careerDNA.name || 'My Profile',
      targetRole,
      experience: experience as any,
      workStyle: workStyle as any,
      preferredLocation,
      priorities,
      skills,
      isComplete: true,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    await updateCareerDNA(updated);
    await addHistoryItem({
      activity: 'Career DNA updated',
      type: 'Company',
      context: `${targetRole} · ${experience}`,
    });

    navigate('/career-dna');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
        <span>
          {user
            ? 'Personal Career Profile · Saved to MongoDB Atlas'
            : 'Interactive Session · Sign in to preserve preferences across devices'}
        </span>
      </div>

      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
          PERSONALIZATION / YOUR PREFERENCES
        </span>
        <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
          Build your Career DNA
        </h1>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
          A company's score is only one part of the story. Define what a good fit means for you.
        </p>
      </div>

      {/* Stepper Tabs (1 to 5) */}
      <div className="grid grid-cols-5 gap-2 border-b border-[#E2E8F0] dark:border-[#26324A] pb-3 text-[12px] font-medium">
        {[
          { num: 1, name: 'Role' },
          { num: 2, name: 'Experience' },
          { num: 3, name: 'Priorities' },
          { num: 4, name: 'Work style' },
          { num: 5, name: 'Skills & review' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[4px] transition-colors cursor-pointer text-left ${
              step === s.num
                ? 'bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] font-bold border border-[#D5DCF3] dark:border-[#384869]'
                : step > s.num
                ? 'text-[#177454] dark:text-[#22C55E] bg-[#EBF8F2]/60 dark:bg-[#0E2A1A]/60 hover:bg-[#EBF8F2]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]'
            }`}
          >
            {step > s.num ? (
              <Check size={13} className="shrink-0 text-[#177454] dark:text-[#22C55E]" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px] shrink-0 font-bold">
                {s.num}
              </span>
            )}
            <span className="truncate">{s.name}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main form container */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-6">
          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  01 / Choose your target role
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Select the primary engineering track you are pursuing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTargetRole(r)}
                    className={`p-3.5 rounded-[4px] border text-left text-[13px] font-medium transition-all cursor-pointer ${
                      targetRole === r
                        ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] font-bold'
                        : 'border-[#E2E8F0] dark:border-[#26324A] hover:border-[#CBD5E1] dark:hover:border-[#384869] text-[#14213D] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          targetRole === r ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#373D91] dark:bg-[#8B5CF6]' : 'border-[#CBD5E1] dark:border-[#384869]'
                        }`}
                      >
                        {targetRole === r && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{r}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" size="md" onClick={() => setStep(2)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  02 / Your experience
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Used to calibrate your research, not to predict your career.
                </p>
              </div>

              <div className="space-y-2.5">
                {experienceLevels.map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setExperience(exp as any)}
                    className={`w-full p-3.5 rounded-[4px] border text-left text-[13px] font-medium transition-all cursor-pointer ${
                      experience === exp
                        ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] font-bold'
                        : 'border-[#E2E8F0] dark:border-[#26324A] hover:border-[#CBD5E1] dark:hover:border-[#384869] text-[#14213D] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          experience === exp ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#373D91] dark:bg-[#8B5CF6]' : 'border-[#CBD5E1] dark:border-[#384869]'
                        }`}
                      >
                        {experience === exp && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{exp}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(3)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PRIORITIES (Page 22 & 23 in Figma) */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  What matters most in your next company?
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Step 3 of 5 · Set each priority independently. These are preferences, not company ratings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { key: 'learning', label: 'Learning', val: priorities.learning },
                  { key: 'stability', label: 'Stability', val: priorities.stability },
                  { key: 'growth', label: 'Growth', val: priorities.growth },
                  { key: 'culture', label: 'Culture', val: priorities.culture },
                  { key: 'salary', label: 'Salary', val: priorities.salary },
                  { key: 'technology', label: 'Technology', val: priorities.technology },
                  { key: 'wlb', label: 'Work-Life Balance', val: priorities.wlb },
                  { key: 'location', label: 'Location', val: priorities.location },
                ].map(({ key, label, val }) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                      <span>{label}</span>
                      <span className="text-[#373D91] dark:text-[#8B5CF6]">{val}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(key as any, Number(e.target.value))}
                      className="w-full accent-[#7547CB] h-1.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                <Button variant="outline" size="md" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(4)}>
                  Continue to work style <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: WORK STYLE */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  04 / How do you want to work?
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Set location flexibility and in-office expectations.
                </p>
              </div>

              <div className="space-y-2.5">
                {workStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setWorkStyle(style as any)}
                    className={`w-full p-3.5 rounded-[4px] border text-left text-[13px] font-medium transition-all cursor-pointer ${
                      workStyle === style
                        ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] font-bold'
                        : 'border-[#E2E8F0] dark:border-[#26324A] hover:border-[#CBD5E1] dark:hover:border-[#384869] text-[#14213D] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          workStyle === style ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#373D91] dark:bg-[#8B5CF6]' : 'border-[#CBD5E1] dark:border-[#384869]'
                        }`}
                      >
                        {workStyle === style && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{style}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC] block mb-1">
                  Preferred location
                </label>
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[13px] text-[#14213D] dark:text-[#F8FAFC]"
                >
                  <option value="Bangalore, India">Bangalore, India</option>
                  <option value="Mumbai, India">Mumbai, India</option>
                  <option value="Hyderabad, India">Hyderabad, India</option>
                  <option value="Pune, India">Pune, India</option>
                  <option value="Delhi NCR, India">Delhi NCR, India</option>
                </select>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                <Button variant="outline" size="md" onClick={() => setStep(3)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(5)}>
                  Continue to skills <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SKILLS & REVIEW */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  05 / Skills & final review
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Select key skills you want to strengthen.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSkills.map((sk) => {
                  const isChecked = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`p-2.5 rounded-[4px] border text-left text-[12px] font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#373D91] dark:border-[#8B5CF6] bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] font-bold'
                          : 'border-[#E2E8F0] dark:border-[#26324A] hover:border-[#CBD5E1] dark:hover:border-[#384869] text-[#14213D] dark:text-[#F8FAFC]'
                      }`}
                    >
                      <span>{sk}</span>
                      {isChecked && <Check size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />}
                    </button>
                  );
                })}
              </div>

              {/* Review summary box */}
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] space-y-1">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Profile Configuration
                </span>
                <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] block">
                  {targetRole} · {experience} · {workStyle}
                </span>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                  Learning {priorities.learning} · Growth {priorities.growth} · Stability {priorities.stability} · Culture {priorities.culture} · WLB {priorities.wlb} · Salary {priorities.salary}
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                <Button variant="outline" size="md" onClick={() => setStep(4)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleFinalSubmit}>
                  Generate My Career DNA
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Sidecar (Page 22) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-3">
            <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
              Your profile so far
            </span>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] flex items-center justify-center font-bold text-[11px]">
                DNA
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                  {targetRole}
                </h3>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {experience}
                </span>
              </div>
            </div>

            <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
              Learning, growth and stability are currently configured as your strongest priorities.
            </p>

            <div className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[11px] text-[#64748B] dark:text-[#94A3B8] space-y-1">
              <span>You can change these later. Career Fit updates with your preferences; Company Intelligence does not.</span>
              <span className="font-semibold block text-[#373D91] dark:text-[#8B5CF6] pt-1">
                User preference · Not evidence
              </span>
            </div>
          </div>

          <div className="bg-[#FAFBFD] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-2">
            <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Why we ask</h4>
            <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
              Your profile helps interpret the same company evidence differently for your goals. We do not infer sensitive personal characteristics or guarantee hiring outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

