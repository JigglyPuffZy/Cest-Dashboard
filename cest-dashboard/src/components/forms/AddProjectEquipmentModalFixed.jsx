import { useState, useEffect } from "react";
import { X, Upload, Check, FileText, Eye } from "lucide-react";
import { COMPONENTS, COMP_COLORS, COMMUNITY_TYPES, COMMUNITY_COLORS, STATUS_OPTIONS } from "../../shared/constants";
import { supabase } from "../../shared/services/supabaseClient";
import { LoadingButton } from "../ui/LoadingButton";
import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts";
import { HoverTooltip } from "../ui/Tooltip";
import { Modal } from "../ui/Modal";

export const AddProjectEquipmentModal = ({ onClose, onSaveProject, onSaveEquipment, darkMode, initialData }) => {
  const isEditMode = !!initialData;

  const getInitialFormData = () => {
    if (!initialData) return {
      year: new Date().getFullYear(),
      province: "", municipality: "", community: "",
      project: "", amountFunded: "", amountPerYear: "",
      status: "Ongoing", components: [], communities: [],
      beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
      stakeholders: "LGU", stakeholdersOther: "",
      fileData: null, fileName: "", fileType: "",
      equipmentList: [{ equipment: "", units: "", unitsPerYear: "", component: "", projectTitle: "" }]
    };

    // Pre-fill from existing project/equipment data
    const d = initialData;
    const isProject = !!(d.project_title || d.project);
    return {
      year: d.year || new Date().getFullYear(),
      province: d.province_id || (typeof d.province === 'object' ? d.province?.id : d.province) || "",
      municipality: d.municipality_id || (typeof d.municipality === 'object' ? d.municipality?.id : d.municipality) || "",
      community: d.community || "",
      project: d.project_title || d.project || "",
      amountFunded: d.amount_funded || d.amountFunded || "",
      amountPerYear: d.amount_per_year || d.amountPerYear || "",
      status: d.status || "Ongoing",
      components: d.components || [],
      communities: d.communities || [],
      beneficiaries: d.beneficiaries || { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
      stakeholders: typeof d.stakeholders === 'object' ? "LGU" : (d.stakeholders || "LGU"),
      stakeholdersOther: d.stakeholdersOther || "",
      fileData: d.file_data || null,
      fileName: d.file_name || "",
      fileType: d.file_type || "",
      equipmentList: d.equipment_name ? [{ 
        equipment: d.equipment_name || d.equipment || "",
        units: d.units || "",
        unitsPerYear: d.units_per_year || d.unitsPerYear || "",
        component: d.component_id || d.component || "",
        projectTitle: d.project_title || d.projectName || d.project?.project_title || ""
      }] : [{ equipment: "", units: "", unitsPerYear: "", component: "", projectTitle: "" }]
    };
  };

  const [formData, setFormData] = useState(() => getInitialFormData());

  const [errors, setErrors] = useState({});
  const [municipalities, setMunicipalities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  // Load provinces from Supabase on mount
  useEffect(() => {
    loadProvincesFromSupabase();
    // If editing, load municipalities for the pre-selected province
    if (initialData && formData.province) {
      handleProvinceChange(formData.province, true);
    }
  }, []);

  const loadProvincesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProvinces(data || []);
    } catch (err) {
      setProvinces([]);
    }
  };

  const handleProvinceChange = async (provinceId, keepMunicipality = false) => {
    if (!keepMunicipality) {
      setFormData(prev => ({ ...prev, province: provinceId, municipality: "" }));
    } else {
      setFormData(prev => ({ ...prev, province: provinceId }));
    }
    
    if (!provinceId) { setMunicipalities([]); return; }

    try {
      setLoadingMunicipalities(true);
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name')
        .eq('province_id', provinceId)
        .order('name');
      if (error) throw error;
      setMunicipalities(data || []);
    } catch (err) {
      setMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': onClose,
    'ctrl+s': (e) => {
      e.preventDefault();
      handleSubmit();
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          fileData: reader.result,
          fileName: file.name,
          fileType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeneficiaryChange = (type, value) => {
    const newBeneficiaries = { ...formData.beneficiaries, [type]: parseInt(value) || 0 };
    const total = newBeneficiaries.male + newBeneficiaries.female + newBeneficiaries.ips + 
                  newBeneficiaries.fourps + newBeneficiaries.pwd + newBeneficiaries.senior;
    newBeneficiaries.total = total;
    setFormData({ ...formData, beneficiaries: newBeneficiaries });
  };

  const toggleComponent = (comp) => {
    const newComponents = formData.components.includes(comp)
      ? formData.components.filter(c => c !== comp)
      : [...formData.components, comp];
    setFormData({ ...formData, components: newComponents });
  };

  const toggleCommunity = (comm) => {
    const newCommunities = formData.communities.includes(comm)
      ? formData.communities.filter(c => c !== comm)
      : [...formData.communities, comm];
    setFormData({ ...formData, communities: newCommunities });
  };

  const addEquipmentEntry = () => {
    setFormData(prev => ({
      ...prev,
      equipmentList: [...(prev.equipmentList || []), { equipment: "", units: "", unitsPerYear: "", component: "", projectTitle: "" }]
    }));
  };

  const removeEquipmentEntry = (index) => {
    setFormData(prev => {
      const currentList = prev.equipmentList || [];
      if (currentList.length > 1) {
        const newList = currentList.filter((_, i) => i !== index);
        return { ...prev, equipmentList: newList };
      }
      return prev;
    });
  };

  const updateEquipmentEntry = (index, field, value) => {
    setFormData(prev => {
      const currentList = prev.equipmentList || [];
      const newList = [...currentList];
      if (newList[index]) {
        newList[index] = { ...newList[index], [field]: value };
      }
      return { ...prev, equipmentList: newList };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.community) newErrors.community = "Community is required";

    // In edit mode, municipality might already be set as ID — only require it for new entries
    if (!isEditMode) {
      if (!formData.province) newErrors.province = "Province is required";
      if (!formData.municipality) newErrors.municipality = "Municipality is required";
    }

    const isEquipmentItem = initialData && !!(initialData.equipment_name || initialData.equipment) && !(initialData.project_title || initialData.project);
    const hasProjectFields = !isEquipmentItem && (formData.project || formData.amountFunded || formData.components.length > 0);
    const hasEquipmentFields = isEquipmentItem || (formData.equipmentList || []).some(eq => eq.equipment || eq.units || eq.component);

    if (!hasProjectFields && !hasEquipmentFields) {
      newErrors.general = "Please fill either project details or equipment details";
    }

    if (hasProjectFields) {
      if (!formData.project) newErrors.project = "Project title is required";
      if (!formData.amountFunded) newErrors.amountFunded = "Amount funded is required";
      if (formData.components.length === 0) newErrors.components = "Select at least one component";
    }

    if (hasEquipmentFields) {
      (formData.equipmentList || []).forEach((eq, index) => {
        if (eq.equipment || eq.units || eq.component) { // If any field is filled, validate all required fields
          if (!eq.equipment) newErrors[`equipment_${index}`] = "Equipment/Technology is required";
          if (!eq.units) newErrors[`units_${index}`] = "Number of units is required";
          if (!eq.component) newErrors[`component_${index}`] = "Component is required";
        }
      });
      
      // Check if at least one equipment entry is filled
      const hasValidEquipment = (formData.equipmentList || []).some(eq => eq.equipment && eq.units && eq.component);
      if (!hasValidEquipment && hasEquipmentFields) {
        newErrors.equipmentGeneral = "Please complete at least one equipment entry";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const isEquipmentItem = initialData && !!(initialData.equipment_name || initialData.equipment) && !(initialData.project_title || initialData.project);
    const hasProjectFields = !isEquipmentItem && (formData.project || formData.amountFunded || formData.components.length > 0);
    const hasEquipmentFields = isEquipmentItem || (formData.equipmentList || []).some(eq => eq.equipment || eq.units || eq.component);

    console.log('Form submission debug:', {
      hasProjectFields,
      hasEquipmentFields,
      projectTitle: formData.project,
      amountFunded: formData.amountFunded,
      components: formData.components,
      equipmentList: formData.equipmentList
    });

    if (hasProjectFields) {
      const total = (parseInt(formData.beneficiaries.male) || 0) + (parseInt(formData.beneficiaries.female) || 0);
      
      // Validate amount_funded to prevent overflow (max 10^13)
      const amountFunded = parseFloat(formData.amountFunded) || 0;
      const amountPerYear = parseFloat(formData.amountPerYear) || 0;
      
      if (amountFunded >= 10000000000000) { // 10^13
        alert('Amount funded is too large. Please enter a smaller amount.');
        setIsSubmitting(false);
        return;
      }
      
      if (amountPerYear >= 10000000000000) { // 10^13
        alert('Amount per year is too large. Please enter a smaller amount.');
        setIsSubmitting(false);
        return;
      }
      
      const projectData = {
        year: formData.year,
        province_id: formData.province || initialData?.province_id || null,
        municipality_id: formData.municipality || initialData?.municipality_id || null,
        community: formData.community,
        project_title: formData.project,
        amount_funded: amountFunded > 0 ? amountFunded : null,
        amount_per_year: amountPerYear > 0 ? amountPerYear : null,
        status: formData.status || 'Ongoing',
        components: formData.components.length > 0 ? formData.components : [],
        communities: formData.communities.length > 0 ? formData.communities : [],
        beneficiaries: { ...formData.beneficiaries, total },
        stakeholders: formData.stakeholders,
        file_data: formData.fileData,
        file_name: formData.fileName,
        file_type: formData.fileType
      };
      
      console.log('Submitting project data:', projectData);
      
      try {
        const newProject = await onSaveProject(projectData);
        console.log('Project saved successfully:', newProject);
        
        // If we have equipment and a new project was created, link them
        if (hasEquipmentFields && newProject && newProject.id) {
          console.log('Linking equipment to new project:', newProject.id);
          
          // Small delay to ensure project is fully committed to database
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Create array to hold equipment promises
          const equipmentPromises = [];
          
          // Update equipment data to include the new project_id
          (formData.equipmentList || []).forEach((eq, equipmentIndex) => {
            if (eq.equipment && eq.units && eq.component) {
              const units = parseInt(eq.units) || 0;
              const unitsPerYear = parseInt(eq.unitsPerYear) || 0;
              
              // Validate units to prevent overflow
              if (units >= 1000000) {
                alert(`Equipment entry ${equipmentIndex + 1}: Number of units is too large. Please enter a smaller number.`);
                setIsSubmitting(false);
                return;
              }
              
              const equipmentData = {
                year: formData.year,
                municipality_id: formData.municipality || initialData?.municipality_id || null,
                community: formData.community,
                equipment_name: eq.equipment,
                units: units,
                units_per_year: unitsPerYear > 0 ? unitsPerYear : null,
                component_id: eq.component,
                project_title: formData.project, // Use the project title from the form
                project_id: newProject.id // Link to the newly created project
              };
              
              console.log(`Submitting equipment ${equipmentIndex + 1} with project link:`, equipmentData);
              equipmentPromises.push(onSaveEquipment(equipmentData));
            }
          });
          
          try {
            await Promise.all(equipmentPromises);
            console.log('All equipment saved and linked to project successfully');
          } catch (error) {
            console.error('Error saving equipment:', error);
            alert('Failed to save equipment: ' + error.message);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project: ' + error.message);
        setIsSubmitting(false);
        return;
      }
    }

    // Handle standalone equipment (when no project is being created)
    if (hasEquipmentFields && !hasProjectFields) {
      // Save each equipment entry that has data
      const equipmentPromises = [];
      (formData.equipmentList || []).forEach((eq, equipmentIndex) => {
        if (eq.equipment && eq.units && eq.component) {
          const units = parseInt(eq.units) || 0;
          const unitsPerYear = parseInt(eq.unitsPerYear) || 0;
          
          // Validate units to prevent overflow
          if (units >= 1000000) {
            alert(`Equipment entry ${equipmentIndex + 1}: Number of units is too large. Please enter a smaller number.`);
            setIsSubmitting(false);
            return;
          }
          
          const equipmentData = {
            year: formData.year,
            municipality_id: formData.municipality || initialData?.municipality_id || null,
            community: formData.community,
            equipment_name: eq.equipment,
            units: units,
            units_per_year: unitsPerYear > 0 ? unitsPerYear : null,
            component_id: eq.component,
            project_title: eq.projectTitle || null
          };
          
          console.log(`Submitting standalone equipment ${equipmentIndex + 1}:`, equipmentData);
          equipmentPromises.push(onSaveEquipment(equipmentData));
        }
      });
      
      try {
        await Promise.all(equipmentPromises);
        console.log('All standalone equipment saved successfully');
      } catch (error) {
        console.error('Error saving equipment:', error);
        alert('Failed to save equipment: ' + error.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  const modalStyle = {
    background: darkMode ? '#1e293b' : '#ffffff',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
  };

  const inputStyle = {
    background: darkMode ? '#0f172a' : '#ffffff',
    color: darkMode ? '#f8fafc' : '#0f172a',
    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
  };

  return (
    <Modal onClose={onClose} zIndex={9999}>
      <div 
        className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-modal-fade-in"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: darkMode ? '#334155' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #004A98, #10b981)' }}>
                <div className="flex items-center gap-1">
                  <span className="text-white text-lg">⚙️</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  {isEditMode ? 'Edit Project & Equipment' : 'Add Project & Equipment'}
                </h2>
                <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {isEditMode ? 'Update the details below' : 'Fill in project and/or equipment details below'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-200"
            >
              <X className="w-6 h-6" style={{ color: '#ef4444' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                📍 Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Year <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={inputStyle}
                    min="2020"
                    max="2030"
                  />
                  {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Province <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={inputStyle}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Municipality <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={inputStyle}
                    disabled={!formData.province || loadingMunicipalities}
                  >
                    <option value="">
                      {loadingMunicipalities ? "Loading municipalities..." : "Select Municipality"}
                    </option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.municipality && <p className="text-red-500 text-xs mt-1">{errors.municipality}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Community <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    placeholder="Enter community name"
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={inputStyle}
                  />
                  {errors.community && <p className="text-red-500 text-xs mt-1">{errors.community}</p>}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                📋 Project Details (Optional)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Enter project title"
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={inputStyle}
                  />
                  {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Amount Funded (₱)
                    </label>
                    <input
                      type="number"
                      value={formData.amountFunded}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value < 10000000000000) { // Prevent overflow
                          setFormData({ ...formData, amountFunded: e.target.value });
                        }
                      }}
                      placeholder="0"
                      max="9999999999999"
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                      style={inputStyle}
                    />
                    {errors.amountFunded && <p className="text-red-500 text-xs mt-1">{errors.amountFunded}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Amount Per Year (₱)
                    </label>
                    <input
                      type="number"
                      value={formData.amountPerYear}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value < 10000000000000) { // Prevent overflow
                          setFormData({ ...formData, amountPerYear: e.target.value });
                        }
                      }}
                      placeholder="0"
                      max="9999999999999"
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                      style={inputStyle}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Stakeholders
                    </label>
                    <select
                      value={formData.stakeholders}
                      onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value, stakeholdersOther: "" })}
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                      style={inputStyle}
                    >
                      {["LGU", "PLGU", "BLGU", "PNP", "SUC", "Others (Specify)"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.stakeholders === "Others (Specify)" && (
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Specify Stakeholder
                    </label>
                    <input
                      type="text"
                      value={formData.stakeholdersOther}
                      onChange={(e) => setFormData({ ...formData, stakeholdersOther: e.target.value })}
                      placeholder="Enter stakeholder name"
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* Components */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-center" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    CEST Components
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(COMPONENTS).map(([key, name]) => (
                      <HoverTooltip
                        key={key}
                        content={name}
                        position="auto"
                        darkMode={darkMode}
                        delay={150}
                      >
                        <button
                          type="button"
                          onClick={() => toggleComponent(key)}
                          className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-110 hover:shadow-xl relative overflow-hidden group"
                          style={{
                            background: formData.components.includes(key) 
                              ? `linear-gradient(135deg, ${COMP_COLORS[key]}25, ${COMP_COLORS[key]}35)` 
                              : darkMode ? 'linear-gradient(135deg, #334155, #475569)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                            color: formData.components.includes(key) 
                              ? COMP_COLORS[key] 
                              : darkMode ? '#94a3b8' : '#64748b',
                            border: `2px solid ${formData.components.includes(key) 
                              ? COMP_COLORS[key] 
                              : darkMode ? '#475569' : '#e2e8f0'}`,
                            boxShadow: formData.components.includes(key)
                              ? `0 8px 25px ${COMP_COLORS[key]}30, 0 4px 12px ${COMP_COLORS[key]}20`
                              : darkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {/* Shine effect on hover */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-all duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"
                            style={{ width: '50%' }}
                          />
                          
                          {/* Selection indicator */}
                          {formData.components.includes(key) && (
                            <div 
                              className="absolute top-1 right-1 w-2 h-2 rounded-full"
                              style={{ 
                                background: COMP_COLORS[key],
                                boxShadow: `0 0 8px ${COMP_COLORS[key]}80`
                              }}
                            />
                          )}
                          
                          <span className="relative z-10">{key.toUpperCase()}</span>
                        </button>
                      </HoverTooltip>
                    ))}
                  </div>
                  {errors.components && <p className="text-red-500 text-xs mt-1">{errors.components}</p>}
                </div>

                {/* No. of Beneficiaries */}
                <div className="p-4 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <label className="block text-sm font-bold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    👥 No. of Beneficiaries
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { key: 'male', label: 'Male' },
                      { key: 'female', label: 'Female' },
                      { key: 'ips', label: 'IPs' },
                      { key: 'fourps', label: '4Ps' },
                      { key: 'pwd', label: 'PWD' },
                      { key: 'senior', label: 'Senior' },
                    ].map(({ key, label }) => (
                      <div key={key} className="text-center">
                        <label className="block text-xs font-semibold mb-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{label}</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.beneficiaries[key]}
                          onChange={(e) => handleBeneficiaryChange(key, e.target.value)}
                          className="w-full py-2 px-2 rounded-lg text-sm font-medium text-center transition-all duration-200"
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs font-bold" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Total: <span style={{ color: '#004A98' }}>{formData.beneficiaries.total}</span>
                    </span>
                  </div>
                </div>

                {/* Community Types */}
                <div className="p-4 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <label className="block text-sm font-bold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    🏘️ Community Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(COMMUNITY_TYPES).map(([key, name]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCommunity(key)}
                        className="px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1"
                        style={{
                          background: formData.communities.includes(key)
                            ? `${COMMUNITY_COLORS[key]}20`
                            : darkMode ? '#334155' : '#f1f5f9',
                          color: formData.communities.includes(key)
                            ? COMMUNITY_COLORS[key]
                            : darkMode ? '#94a3b8' : '#64748b',
                          border: `1px solid ${formData.communities.includes(key)
                            ? COMMUNITY_COLORS[key]
                            : darkMode ? '#475569' : '#e2e8f0'}`
                        }}
                      >
                        {formData.communities.includes(key) && <Check className="w-3 h-3" />}
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    📎 Attachment (PDF only)
                  </label>
                  <div
                    className="w-full rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                    style={{ borderColor: darkMode ? '#334155' : '#cbd5e1', background: darkMode ? '#0f172a' : '#f8fafc' }}
                    onClick={() => document.getElementById('pdf-upload').click()}
                  >
                    {formData.fileName ? (
                      <div className="flex items-center gap-3 w-full">
                        <FileText className="w-8 h-8 flex-shrink-0" style={{ color: '#ef4444' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{formData.fileName}</p>
                          <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>PDF attached</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); window.open(formData.fileData, '_blank'); }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold"
                          style={{ background: '#004A98', color: '#fff' }}
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, fileData: null, fileName: "", fileType: "" }); }}
                          className="p-1 rounded-lg"
                          style={{ color: '#ef4444' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                        <p className="text-sm font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Click to upload PDF</p>
                        <p className="text-xs" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>PDF files only</p>
                      </>
                    )}
                  </div>
                  <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                </div>
              </div>
            </div>

            {/* Equipment Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    📦 Equipment Details
                    <span className="text-xs px-2 py-1 rounded-full" style={{ 
                      background: darkMode ? '#334155' : '#e2e8f0', 
                      color: darkMode ? '#94a3b8' : '#64748b' 
                    }}>
                      Optional
                    </span>
                  </h3>
                  <p className="text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Add equipment and technology items for this project
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEquipmentEntry}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Equipment
                </button>
              </div>
              
              <div className="space-y-4">
                {(formData.equipmentList || []).map((equipment, index) => (
                  <div 
                    key={`equipment-${index}-stable`}
                    className="relative rounded-lg p-4 border"
                    style={{
                      background: darkMode ? '#1e293b' : '#ffffff',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      boxShadow: darkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                          style={{
                            background: '#004A98',
                            color: '#ffffff'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            Equipment Entry {index + 1}
                          </h4>
                          <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            Fill in the details below
                          </p>
                        </div>
                      </div>
                      
                      {(formData.equipmentList || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEquipmentEntry(index)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{
                            background: '#ef4444',
                            color: '#ffffff'
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          Project Title/Label
                        </label>
                        <input
                          type="text"
                          value={equipment.projectTitle}
                          onChange={(e) => updateEquipmentEntry(index, 'projectTitle', e.target.value)}
                          placeholder="e.g., Computer Industry Equipment, Digital Literacy Program"
                          className="w-full py-3 px-4 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          style={{
                            background: darkMode ? '#0f172a' : '#f8fafc',
                            color: darkMode ? '#f8fafc' : '#0f172a',
                            border: `1px solid ${darkMode ? '#334155' : '#d1d5db'}`,
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                          💡 Tip: Use the same title as an existing project to automatically link them together
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          Equipment/Technology Name
                        </label>
                        <input
                          type="text"
                          value={equipment.equipment}
                          onChange={(e) => updateEquipmentEntry(index, 'equipment', e.target.value)}
                          placeholder="e.g., Desktop Computer, Printer, Projector"
                          className="w-full py-3 px-4 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{
                            background: darkMode ? '#0f172a' : '#f8fafc',
                            color: darkMode ? '#f8fafc' : '#0f172a',
                            border: `1px solid ${darkMode ? '#334155' : '#d1d5db'}`,
                          }}
                        />
                        {errors[`equipment_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`equipment_${index}`]}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            Number of Units
                          </label>
                          <input
                            type="number"
                            value={equipment.units}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              if (value < 1000000) { // Prevent overflow
                                updateEquipmentEntry(index, 'units', e.target.value);
                              }
                            }}
                            placeholder="0"
                            min="0"
                            max="999999"
                            className="w-full py-3 px-4 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            style={{
                              background: darkMode ? '#0f172a' : '#f8fafc',
                              color: darkMode ? '#f8fafc' : '#0f172a',
                              border: `1px solid ${darkMode ? '#334155' : '#d1d5db'}`,
                            }}
                          />
                          {errors[`units_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`units_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            CEST Component
                          </label>
                          <div className="relative">
                            <select
                              value={equipment.component}
                              onChange={(e) => updateEquipmentEntry(index, 'component', e.target.value)}
                              className="w-full py-3 px-4 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              style={{
                                background: darkMode ? '#0f172a' : '#f8fafc',
                                color: darkMode ? '#f8fafc' : '#0f172a',
                                border: `1px solid ${darkMode ? '#334155' : '#d1d5db'}`,
                              }}
                            >
                              <option value="">Choose a component...</option>
                              {Object.entries(COMPONENTS).map(([key, name]) => (
                                <option key={key} value={key}>
                                  {key.toUpperCase()} - {name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors[`component_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`component_${index}`]}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#334155' : '#e5e7eb' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              background: '#10b981',
                              width: `${((equipment.projectTitle ? 1 : 0) + (equipment.equipment ? 1 : 0) + (equipment.units ? 1 : 0) + (equipment.component ? 1 : 0)) / 4 * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          {((equipment.projectTitle ? 1 : 0) + (equipment.equipment ? 1 : 0) + (equipment.units ? 1 : 0) + (equipment.component ? 1 : 0))} of 4 completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {errors.equipmentGeneral && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm">{errors.equipmentGeneral}</p>
                  </div>
                )}
                
                {/* Helper text */}
                <div className="text-center py-4">
                  <p className="text-xs" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                    💡 Tip: You can add multiple equipment entries for projects with various technology components
                  </p>
                </div>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Submit Reminder */}
            <div className="p-4 rounded-xl" style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(0, 74, 152, 0.1), rgba(16, 185, 129, 0.1))'
                : 'linear-gradient(135deg, rgba(0, 74, 152, 0.05), rgba(16, 185, 129, 0.05))',
              border: `1px solid ${darkMode ? 'rgba(0, 74, 152, 0.2)' : 'rgba(0, 74, 152, 0.1)'}`
            }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #004A98, #10b981)'
                }}>
                  <span className="text-white text-sm">💾</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Ready to save?
                  </p>
                  <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Fill in project and/or equipment details, then click the save button below
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky and Always Visible */}
        <div className="sticky bottom-0 flex-shrink-0 p-4 border-t" style={{ 
          borderColor: darkMode ? '#334155' : '#e5e7eb',
          background: darkMode ? '#1e293b' : '#ffffff',
          boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting 
                  ? '#6b7280' 
                  : 'linear-gradient(135deg, #004A98 0%, #10b981 100%)',
                boxShadow: isSubmitting 
                  ? 'none' 
                  : '0 4px 12px rgba(0, 74, 152, 0.3)'
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                '💾 ' + (isEditMode ? 'Update' : 'Save Project & Equipment')
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};