import React from 'react';
import Select from 'react-select';

/* ─── Elite Design Tokens ─────────────────────────────────────── */
const eliteStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: state.selectProps.mini ? '40px' : '56px',
    height: state.selectProps.mini ? '40px' : '56px',
    border: state.isFocused ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
    borderRadius: state.selectProps.mini ? '12px' : '16px',
    background: '#ffffff',
    boxShadow: state.isFocused 
      ? '0 20px 40px -12px rgba(59, 130, 246, 0.25), 0 0 0 4px rgba(59, 130, 246, 0.1)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: state.isFocused ? 'translateY(-1px)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
      background: '#fafafa',
    }
  }),
  valueContainer: (base, state) => ({
    ...base,
    padding: state.selectProps.mini ? '0 12px' : '0 20px 0 54px',
  }),
  singleValue: (base, state) => ({
    ...base,
    color: '#0f172a',
    fontWeight: 600,
    fontSize: state.selectProps.mini ? '13px' : '15px',
    fontFamily: 'Outfit, Inter, sans-serif',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#64748b',
    fontSize: '15px',
    fontFamily: 'Outfit, Inter, sans-serif',
  }),
  input: (base) => ({
    ...base,
    color: '#0f172a',
    fontFamily: 'Outfit, Inter, sans-serif',
    fontSize: '15px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '20px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 10px 20px -5px rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
    zIndex: 11000,
    marginTop: '8px',
    animation: 'eliteMenuIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  }),
  menuList: (base) => ({
    ...base,
    padding: '10px',
    '::-webkit-scrollbar': { width: '6px' },
    '::-webkit-scrollbar-track': { background: 'transparent' },
    '::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '10px' },
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '12px',
    fontFamily: 'Outfit, Inter, sans-serif',
    fontSize: '14.5px',
    fontWeight: state.isSelected ? 700 : 500,
    color: state.isSelected ? '#ffffff' : state.isFocused ? '#2563eb' : '#475569',
    background: state.isSelected
      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
      : state.isFocused
        ? 'rgba(37, 99, 235, 0.06)'
        : 'transparent',
    cursor: 'pointer',
    padding: '12px 16px',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
    '&:last-child': { marginBottom: 0 },
    '&:active': { transform: 'scale(0.98)' }
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#2563eb' : '#94a3b8',
    paddingRight: '16px',
    transition: 'all 0.2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    paddingRight: '8px',
    '&:hover': { color: '#ef4444' },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontFamily: 'Outfit, Inter, sans-serif',
    color: '#94a3b8',
    padding: '20px',
  }),
};

/**
 * EliteSelect — drop-in replacement for <select> using react-select.
 *
 * Props:
 *   options        — [{ value, label }]
 *   value          — current value string (NOT object)
 *   onChange(val)  — called with the raw value string
 *   placeholder    — placeholder text
 *   isSearchable   — default true
 *   isClearable    — default false
 *   required       — not enforced at browser level; handle in parent
 *   id             — for aria / label linking
 */
const EliteSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  isSearchable = true,
  isClearable = false,
  mini = false,
  id,
  className = '',
}) => {
  const selected = options.find((o) => o.value === value) || null;

  return (
    <Select
      inputId={id}
      className={`elite-select-container ${className}`}
      options={options}
      value={selected}
      onChange={(opt) => onChange(opt ? opt.value : '')}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      classNamePrefix="elite-select"
      menuPlacement="auto"
      menuPortalTarget={document.body}
      mini={mini}
      styles={{
        ...eliteStyles,
        container: (base) => ({ ...base, width: '100%' }),
        menuPortal: (base) => ({ ...base, zIndex: 11000 })
      }}
    />
  );
};

export default EliteSelect;
