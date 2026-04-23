import React, { useState, useEffect } from 'react';
import StatusBanner from './StatusBanner';
import apiClient from '../../api/apiClient';
import enums from '../../config/enums.json';

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => (acc !== null && acc !== undefined) ? acc[part] : undefined, obj);
};

const setNestedValue = (obj, path, value) => {
  const parts = path.split('.');
  const last = parts.pop();
  const deepClone = JSON.parse(JSON.stringify(obj || {}));
  let current = deepClone;
  parts.forEach((part, index) => {
    if (current[part] === undefined || current[part] === null) {
      const nextPart = index + 1 < parts.length ? parts[index + 1] : last;
      current[part] = /^\d+$/.test(nextPart) ? [] : {};
    }
    current = current[part];
  });
  current[last] = value;
  return deepClone;
};

const DynamicForm = ({ config, onStatusChange }) => {
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('INCOMPLETE'); // Mocked initial status
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editedWhileApproved, setEditedWhileApproved] = useState(false);
  const [errors, setErrors] = useState({});

  // Re-fetch when config changes (e.g. changing subtabs)
  useEffect(() => {
    if (!config) return;

    setEditedWhileApproved(false);
    setErrors({});
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(config.fetchEndpoint);
        const data = res.data?.data || {};
        const backendStatus = res.data?.status || 'INCOMPLETE';
        const backendRemarks = res.data?.remarks || '';

        // Merge fetched data over blank schema
        const initialFormState = {};
        config.fields.forEach(f => {
          const val = getNestedValue(data, f.name);
          const currentFormVal = getNestedValue(initialFormState, f.name);
          // Only set if not already present or if the new value is defined
          if (val !== undefined && val !== null) {
              const coerced = (f.type === 'date' && typeof val === 'string' && val.length > 10)
                ? val.slice(0, 10)
                : val;
              Object.assign(initialFormState, setNestedValue(initialFormState, f.name, coerced));
          } else if (currentFormVal === undefined) {
              Object.assign(initialFormState, setNestedValue(initialFormState, f.name, ''));
          }
        });

        setFormData(initialFormState);
        setStatus(backendStatus);
        setRemarks(backendRemarks);
        if (onStatusChange) onStatusChange(backendStatus);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config]);

  const validateField = (field, value) => {
    if (!field.regex) return null;
    if (!value && !field.required) return null; // optional empty fields skip regex
    if (!value && field.required) return null;  // required-empty handled by native required
    return new RegExp(field.regex).test(value) ? null : (field.validationMessage || `Invalid format. Expected: ${field.description || field.regex}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (status === 'APPROVED') setEditedWhileApproved(true);
    setFormData(prev => setNestedValue(prev, name, value));

    const field = config.fields.find(f => f.name === name);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    // In a real app, you might upload right away or stash the File object
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation on all fields before submitting
    const newErrors = {};
    config.fields.forEach(field => {
      const value = getNestedValue(formData, field.name);
      const error = validateField(field, value != null ? String(value) : '');
      if (error) newErrors[field.name] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await apiClient.post(config.saveEndpoint, formData);

      // Change status locally after successful submission
      setStatus('PENDING');
      if (onStatusChange) onStatusChange('PENDING');

      setEditedWhileApproved(false);
      setMessage({ type: 'success', text: 'Data saved successfully and is pending verification.' });
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const backendMsg = (data?.message && data.message !== 'Something went wrong')
        ? data.message
        : (data?.error || null);
      setMessage({ type: 'error', text: backendMsg || 'Failed to save data. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;
  if (loading) return <div>Loading form data...</div>;

  const isReadOnly = status === 'PENDING';

  return (
    <div style={{ maxWidth: '800px' }}>
      <StatusBanner status={status} remarks={remarks} />

      {editedWhileApproved && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          borderRadius: '0.375rem',
          border: '1px solid #FCD34D',
          fontSize: '0.875rem'
        }}>
          You are editing approved data. Saving will reset the status back to <strong>Pending</strong> for re-verification.
        </div>
      )}

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: message.type === 'success' ? '#065F46' : '#B91C1C',
          borderRadius: '0.375rem'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {config.fields.map((field) => {
          const fieldError = errors[field.name];

          const commonProps = {
            id: field.name,
            name: field.name,
            required: field.required,
            disabled: isReadOnly,
            style: {
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: `1px solid ${fieldError ? '#EF4444' : '#D1D5DB'}`,
              backgroundColor: isReadOnly ? '#F3F4F6' : '#FFFFFF'
            }
          };

          return (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor={field.name} style={{ marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>
                {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
              </label>
              {field.description && (
                <span style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.375rem' }}>
                  {field.description}
                </span>
              )}

              {field.type === 'select' ? (
                <select
                  {...commonProps}
                  value={getNestedValue(formData, field.name) || ''}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select {field.label}</option>
                  {(field.options || (field.enumKey && enums[field.enumKey]) || []).map(opt => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const title = typeof opt === 'object' ? opt.title : opt.replace(/_/g, ' ');
                    return <option key={val} value={val}>{title}</option>;
                  })}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  {...commonProps}
                  value={getNestedValue(formData, field.name) || ''}
                  onChange={handleChange}
                  rows={3}
                />
              ) : field.type === 'file' ? (
                <input
                  type="file"
                  {...commonProps}
                  onChange={handleFileChange}
                />
              ) : field.type === 'url' ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                  <input
                    type="url"
                    {...commonProps}
                    maxLength={field.maxLength}
                    value={getNestedValue(formData, field.name) || ''}
                    onChange={handleChange}
                    style={{ ...commonProps.style, flex: 1 }}
                  />
                  {getNestedValue(formData, field.name) && (
                    <a
                      href={getNestedValue(formData, field.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#E5E7EB',
                        color: '#374151',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        border: '1px solid #D1D5DB',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: isReadOnly ? 1 : 0.9
                      }}
                      title="Open external document"
                    >
                      View Link ⧉
                    </a>
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  {...commonProps}
                  maxLength={field.maxLength}
                  value={getNestedValue(formData, field.name) || ''}
                  onChange={handleChange}
                />
              )}
              {fieldError && (
                <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                  {fieldError}
                </span>
              )}
            </div>
          );
        })}

        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save & Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
