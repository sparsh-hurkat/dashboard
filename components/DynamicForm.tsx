import React, { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Save, CheckCircle2, AlertCircle, Loader2, ChevronRight, Check, Layers, Workflow } from 'lucide-react';
import { fetchFormConfiguration, fetchReferenceData } from '../services/mockData';
import { FormConfig, ReferenceData, FormFieldConfig } from '../types';

// --- Helper Components ---

function FieldInfo({ field, required }: { field: any, required?: boolean }) {
  const showRequiredError = field.state.meta.isTouched && required && !field.state.value && field.state.value !== 0 && field.state.value !== false;
  
  return (
    <>
      {showRequiredError ? (
         <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1">
          <AlertCircle size={12} /> This field is required
        </p>
      ) : field.state.meta.touchedErrors ? (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {field.state.meta.touchedErrors}
        </p>
      ) : null}
    </>
  );
}

const FormInstance = ({ config, refs }: { config: FormConfig; refs: ReferenceData }) => {
  // We determine default values based on the field types
  const defaultValues = useMemo(() => {
    const defaults: Record<string, any> = {};
    config.fields.forEach(field => {
      if (field.type === 'checkbox') defaults[field.name] = false;
      else if (field.type === 'number') defaults[field.name] = ''; // or 0
      else defaults[field.name] = '';
    });
    return defaults;
  }, [config]);

  const [completedSections, setCompletedSections] = useState<number>(0);
  
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      console.log('Submitting:', value);
      await new Promise(r => setTimeout(r, 1000));
      alert("Client profile created successfully!");
    },
  });

  const handleNextSection = (sectionIndex: number, sectionId: string) => {
    // Validate current section fields
    const sectionFields = config.fields.filter(f => f.sectionId === sectionId);
    let isValid = true;
    
    // Manually check if required fields have values in the form state
    // Note: In a real app, use form.validateAll() or field validators.
    sectionFields.forEach(field => {
       const val = form.getFieldValue(field.name as any) as any;
       if (field.required && (val === '' || val === null || val === undefined)) {
         isValid = false;
         // Mark as touched to show errors
         const fieldInstance = form.getFieldMeta(field.name as any);
         // @ts-ignore - touching internal state for UI feedback
         form.store.setState(s => ({
            ...s,
            fieldMeta: {
                ...s.fieldMeta,
                [field.name]: { ...s.fieldMeta[field.name], isTouched: true }
            }
         }));
       }
    });

    if (isValid) {
        setCompletedSections(prev => Math.max(prev, sectionIndex + 1));
        // Scroll to next section
        setTimeout(() => {
            const nextEl = document.getElementById(`section-${sectionIndex + 1}`);
            nextEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        // Maybe show a toast or shake animation
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Form Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <UserPlus className="text-primary-600" size={24} />
             New Client Onboarding
           </h2>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => {
                form.reset();
                setCompletedSections(0);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reset Form
          </button>
          
          {/* Only show Submit on the last step or if all sections are revealed */}
          {completedSections === config.sections.length && (
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    onClick={form.handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all animate-in zoom-in"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Save size={16} />
                        Submit Profile
                      </>
                    )}
                  </button>
                )}
              />
          )}
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-auto p-8 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Technical Insight Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg shrink-0">
                <Workflow className="text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Server-Driven Onboarding Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-indigo-50 leading-relaxed">
                  <div>
                    <strong className="text-white block mb-1">Purpose</strong>
                    Streamlining complex, multi-step regulatory workflows (KYC/AML) that require strict data integrity.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Dynamic Rendering</strong>
                    The UI is not hardcoded; it is generated entirely from a backend JSON schema. This allows for conditional rendering and complex validation logic to be defined on the server.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Business Value</strong>
                    Rapidly deploy changes to onboarding flows (e.g., new compliance rules) instantly without requiring a full application deployment or App Store updates.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {config.sections.map((section, index) => {
            const isActive = index === completedSections;
            const isCompleted = index < completedSections;
            const isLocked = index > completedSections;

            if (isLocked) return null; // "if i finish the first section then the second section would appear"

            return (
              <div 
                key={section.id} 
                id={`section-${index}`}
                className={`bg-white border transition-all duration-500 rounded-xl shadow-sm overflow-hidden ${
                   isActive ? 'border-primary-200 ring-4 ring-primary-50/50' : 'border-slate-200 opacity-80'
                } animate-in slide-in-from-bottom-4 fade-in`}
              >
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isActive ? 'bg-primary-50/30 border-primary-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                          {isCompleted ? <Check size={16} /> : index + 1}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isActive ? 'text-primary-900' : 'text-slate-800'}`}>{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                  </div>
                  {isCompleted && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Completed</span>}
                </div>
                
                <div className={`p-6 grid grid-cols-1 md:grid-cols-6 gap-6 ${!isActive && isCompleted ? 'hidden' : ''}`}> 
                {/* ^ We could hide body of completed sections to save space, or keep them open for editing. Let's keep open for editing but visual focus is on active. */}
                  
                  {config.fields.filter(f => f.sectionId === section.id).map((fieldConfig) => {
                    const colSpan = fieldConfig.width === 'full' ? 'md:col-span-6' 
                      : fieldConfig.width === 'half' ? 'md:col-span-3' 
                      : 'md:col-span-2';

                    // Get options from reference data if key exists
                    const options = fieldConfig.optionsKey ? refs[fieldConfig.optionsKey] : [];

                    return (
                      <div key={fieldConfig.name} className={colSpan}>
                        <form.Field
                          name={fieldConfig.name as any}
                          children={(field: any) => (
                            <div className="flex flex-col gap-1.5">
                              <label 
                                htmlFor={field.name} 
                                className="text-sm font-semibold text-slate-700 flex items-center gap-1"
                              >
                                {fieldConfig.label}
                                {fieldConfig.required && <span className="text-red-500">*</span>}
                              </label>
                              
                              {/* INPUTS */}
                              {(fieldConfig.type === 'text' || fieldConfig.type === 'email' || fieldConfig.type === 'number') && (
                                <input
                                  id={field.name}
                                  name={field.name}
                                  type={fieldConfig.type}
                                  placeholder={fieldConfig.placeholder}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                />
                              )}

                              {/* SELECT */}
                              {fieldConfig.type === 'select' && (
                                <div className="relative">
                                  <select
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all appearance-none text-slate-700"
                                  >
                                    <option value="" disabled>Select an option...</option>
                                    {options?.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                    <ChevronRight className="rotate-90" size={16} />
                                  </div>
                                </div>
                              )}

                              {/* TEXTAREA */}
                              {fieldConfig.type === 'textarea' && (
                                <textarea
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  rows={4}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none"
                                />
                              )}

                              {/* RADIO */}
                              {fieldConfig.type === 'radio' && (
                                <div className="flex flex-col gap-2 mt-1">
                                  {options?.map(opt => (
                                    <label key={opt.value} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                                      <input
                                        type="radio"
                                        name={field.name}
                                        value={opt.value}
                                        checked={field.state.value === opt.value}
                                        onChange={() => field.handleChange(opt.value)}
                                        className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                                      />
                                      <span className="text-sm text-slate-700 font-medium">{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {/* CHECKBOX */}
                              {fieldConfig.type === 'checkbox' && (
                                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors mt-1">
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      name={field.name}
                                      checked={field.state.value}
                                      onChange={(e) => field.handleChange(e.target.checked)}
                                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-primary-600 checked:bg-primary-600"
                                    />
                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 peer-checked:opacity-100">
                                      <CheckCircle2 size={14} />
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-slate-700">{fieldConfig.label}</span>
                                      {fieldConfig.description && <span className="text-xs text-slate-500">{fieldConfig.description}</span>}
                                  </div>
                                </label>
                              )}

                              {fieldConfig.description && fieldConfig.type !== 'checkbox' && fieldConfig.type !== 'radio' && (
                                  <p className="text-xs text-slate-500">{fieldConfig.description}</p>
                              )}
                              <FieldInfo field={field} required={fieldConfig.required} />
                            </div>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Section Footer */}
                {isActive && index < config.sections.length - 1 && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleNextSection(index, section.id)}
                      className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Completion Message Placeholder */}
           {completedSections === config.sections.length && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-emerald-800">All Sections Completed</h3>
                <p className="text-emerald-600 text-sm">Please review your information and click "Submit Profile" at the top.</p>
            </div>
          )}
        </div>
        
        {/* Footer padding for scroll */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export const DynamicForm: React.FC = () => {
    // 1. Fetch Form Configuration
    const { data: config, isLoading: configLoading } = useQuery({
        queryKey: ['formConfig'],
        queryFn: fetchFormConfiguration
    });

    // 2. Fetch Reference Data
    const { data: refs, isLoading: refsLoading } = useQuery({
        queryKey: ['formRefs'],
        queryFn: fetchReferenceData
    });

    if (configLoading || refsLoading || !config || !refs) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading form configuration...</p>
            </div>
        );
    }

    return <FormInstance config={config} refs={refs} />;
};