import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadarChart } from '../../components/ui/RadarChart';
import { Badge } from '../../components/ui/Badge';
import { Edit3, Compass, Sliders, ShieldCheck } from 'lucide-react';

export const CareerDNAProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { careerDNA } = useApp();

  const radarData = [
    { label: 'Learning', value: careerDNA.priorities.learning },
    { label: 'Growth', value: careerDNA.priorities.growth },
    { label: 'Stability', value: careerDNA.priorities.stability },
    { label: 'Culture', value: careerDNA.priorities.culture },
    { label: 'Balance', value: careerDNA.priorities.wlb },
    { label: 'Salary', value: careerDNA.priorities.salary },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
        <span>Personal Career Intelligence Profile · Calibrates individual company alignment</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            YOUR PREFERENCES / PROFILE COMPLETE
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Your Career DNA
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
            Your career priorities, made visible. This profile shapes recommendations—not company evidence.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Edit3 size={13} />}
          onClick={() => navigate('/career-dna/build')}
        >
          Edit Career DNA
        </Button>
      </div>

      {/* Profile Overview (Radar + Priorities Bars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Role + Radar Visualization */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
              {careerDNA.targetRole}
            </h2>
            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5 mb-6">
              {careerDNA.experience} · {careerDNA.workStyle} · {careerDNA.preferredLocation} · Complete
            </span>

            {/* Radar polygon chart */}
            <div className="py-2 flex justify-center">
              <RadarChart data={radarData} size={260} strokeColor="#8B5CF6" fillColor="rgba(139, 92, 246, 0.15)" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F8FAFC] dark:border-[#1E293B]">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mb-2 font-medium">Selected Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {careerDNA.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#1E293B] text-[#14213D] dark:text-[#F8FAFC] rounded-[4px] text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: What Matters Most To You */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-4">
              What matters most to you
            </h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Learning</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.learning}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.learning} height={6} color="#7547CB" animated={false} />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Growth</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.growth}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.growth} height={6} color="#7547CB" animated={false} />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Stability</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.stability}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.stability} height={6} color="#7547CB" animated={false} />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Culture</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.culture}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.culture} height={6} color="#7547CB" animated={false} />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Work-life balance</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.wlb}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.wlb} height={6} color="#7547CB" animated={false} />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Salary</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{careerDNA.priorities.salary}</span>
                </div>
                <ProgressBar value={careerDNA.priorities.salary} height={6} color="#7547CB" animated={false} />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F8FAFC] dark:border-[#1E293B] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Technology {careerDNA.priorities.technology} · Location {careerDNA.priorities.location} · Additional saved preferences
          </div>
        </div>
      </div>

      {/* Summary Archetype Card */}
      <div className="p-6 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] space-y-4">
        <h3 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          A learning-first, growth-oriented profile
        </h3>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] max-w-3xl leading-relaxed">
          You prioritize building strong skills, progressing in your career and finding a stable environment. Salary and work-life balance still matter, but they carry less influence in this saved profile.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge level="high" text="High Learning" />
          <Badge level="high" text="High Growth" />
          <Badge level="high" text="High Stability" />
          <Badge variant="tag" text="User preference" />
        </div>

        <p className="text-[11px] text-[#94A3B8] dark:text-[#64748B]">
          This is a summary of your answers, not an assessment of your ability or future success.
        </p>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<Compass size={14} />}
            onClick={() => navigate('/career-fit')}
          >
            Find companies that match my profile
          </Button>
        </div>
      </div>

      {/* Bottom 2 Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">
              Start with your saved profile
            </h4>
            <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-4">
              TCS is an illustrative 87% Career Fit for this saved DNA. Explore the evidence behind it.
            </p>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate('/career-fit')}>
              View Career Fit
            </Button>
          </div>
        </div>

        <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">
              Explore a different scenario
            </h4>
            <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-4">
              The comparison demo uses a separate scenario. Rankings can change without changing the underlying company score.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              icon={<Sliders size={13} />}
              onClick={() => navigate('/what-if')}
            >
              Try What-If Simulator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

