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

  // Re-fetch when config changes (e.g. changing subtabs)
  useEffect(() => {
    if (!config) return;

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
              Object.assign(initialFormState, setNestedValue(initialFormState, f.name, val));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => setNestedValue(prev, name, value));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    // In a real app, you might upload right away or stash the File object
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await apiClient.post(config.saveEndpoint, formData);

      // Change status locally after successful submission
      setStatus('PENDING');
      if (onStatusChange) onStatusChange('PENDING');

      setMessage({ type: 'success', text: 'Data saved successfully and is pending verification.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save data. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;
  if (loading) return <div>Loading form data...</div>;

  const isReadOnly = status === 'PENDING' || status === 'APPROVED';

  return (
    <div style={{ maxWidth: '800px' }}>
      <StatusBanner status={status} remarks={remarks} />

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
          const commonProps = {
            id: field.name,
            name: field.name,
            required: field.required,
            disabled: isReadOnly,
            style: {
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #D1D5DB',
              backgroundColor: isReadOnly ? '#F3F4F6' : '#FFFFFF'
            }
          };

          return (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor={field.name} style={{ marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
              </label>

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
