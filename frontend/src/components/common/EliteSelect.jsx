import React from 'react';
import Select from 'react-select';

/* ─── Elite Design Tokens ─────────────────────────────────────── */
const eliteStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '56px',
    height: '56px',
    border: state.isFocused ? '1px solid #3b82f6' : '1px solid #e2e8f0',
    borderRadius: '18px',
    background: '#ffffff',
    boxShadow: state.isFocused 
      ? '0 12px 24px -10px rgba(59, 130, 246, 0.2), 0 0 0 4px rgba(59, 130, 246, 0.08)' 
      : '0 2px 4px rgba(0,0,0,0.02)',
    paddingLeft: '0',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: state.isFocused ? 'translateY(-2px)' : 'none',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 20px 0 56px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: 600,
    fontSize: '15.5px',
    fontFamily: 'Outfit, Inter, sans-serif',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '15.5px',
    fontFamily: 'Outfit, Inter, sans-serif',
  }),
  input: (base) => ({
    ...base,
    color: '#0f172a',
    fontFamily: 'Outfit, Inter, sans-serif',
    fontSize: '15.5px',
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12), 0 8px 24px rgba(15, 23, 42, 0.06)',
    overflow: 'hidden',
    zIndex: 11000,
    marginTop: '6px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '8px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '10px',
    fontFamily: 'Outfit, Inter, sans-serif',
    fontSize: '14px',
    fontWeight: state.isSelected ? 700 : 500,
    color: state.isSelected ? '#ffffff' : state.isFocused ? '#1e40af' : '#334155',
    background: state.isSelected
      ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
      : state.isFocused
        ? 'rgba(59, 130, 246, 0.07)'
        : 'transparent',
    cursor: 'pointer',
    padding: '10px 14px',
    transition: 'all 0.15s ease',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#2563eb' : '#94a3b8',
    paddingRight: '12px',
    transition: 'color 0.2s ease, transform 0.2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    '&:hover': { color: '#ef4444' },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontFamily: 'Outfit, Inter, sans-serif',
    color: '#94a3b8',
    fontSize: '14px',
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
      styles={{
        ...eliteStyles,
        container: (base) => ({ ...base, width: '100%' }),
        menuPortal: (base) => ({ ...base, zIndex: 11000 })
      }}
    />
  );
};

export default EliteSelect;
