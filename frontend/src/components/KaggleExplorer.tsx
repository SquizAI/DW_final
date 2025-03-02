import React, { useState } from 'react';
import axios from 'axios';
import { searchKaggleDatasets, validateKaggleApiKey, downloadKaggleDataset } from '../services/kaggle';

// Define interface for KaggleDataset based on frontend/src/services/kaggle.ts
interface KaggleDataset {
  ref: string;
  title: string;
  size: string;
  lastUpdated: string;
  downloadCount: number;
  description: string;
  url: string;
}

const KaggleExplorer: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiValid, setApiValid] = useState<boolean | null>(null);
  const [query, setQuery] = useState<string>('');
  const [datasets, setDatasets] = useState<KaggleDataset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const handleValidate = async () => {
    try {
      const valid = await validateKaggleApiKey(apiKey);
      setApiValid(valid);
      if (valid) {
        // Set the API key in axios default headers for subsequent backend calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
      }
    } catch (err) {
      setApiValid(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const results = await searchKaggleDatasets(query);
      setDatasets(results);
    } catch (err) {
      setError('Failed to fetch datasets.');
    }
    setLoading(false);
  };

  const handleDownload = async (datasetRef: string) => {
    setDownloadStatus('Initiating download...');
    try {
      await downloadKaggleDataset(datasetRef);
      setDownloadStatus('Download initiated successfully!');
    } catch (err) {
      setDownloadStatus('Download failed. Please try again.');
    }
    // Clear the download status after a few seconds
    setTimeout(() => setDownloadStatus(''), 5000);
  };

  return (
    <div className="kaggle-explorer" style={styles.container}>
      <h1 style={styles.title}>Kaggle Explorer</h1>
      <section style={styles.section}>
        <h2 style={styles.subtitle}>API Key Validation</h2>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter Kaggle API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleValidate} style={styles.button}>Validate API Key</button>
        </div>
        {apiValid !== null && (
          <p style={apiValid ? styles.success : styles.error}>
            {apiValid ? 'API Key is valid!' : 'Invalid API Key'}
          </p>
        )}
      </section>

      {apiValid && (
        <section style={styles.section}>
          <h2 style={styles.subtitle}>Search Datasets</h2>
          <form onSubmit={handleSearch} style={styles.form}>
            <input
              type="text"
              placeholder="Search Kaggle Datasets"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Search</button>
          </form>
          {loading && <p>Loading...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {downloadStatus && <p style={styles.info}>{downloadStatus}</p>}
          <ul style={styles.datasetList}>
            {datasets.map((dataset) => (
              <li key={dataset.ref} style={styles.datasetItem}>
                <h3>{dataset.title}</h3>
                <p>{dataset.description}</p>
                <small>Last Updated: {dataset.lastUpdated}</small><br />
                <span>Downloads: {dataset.downloadCount}</span><br />
                <div style={styles.buttonGroup}>
                  <a href={dataset.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    View on Kaggle
                  </a>
                  <button onClick={() => handleDownload(dataset.ref)} style={styles.downloadButton}>
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// Inline styles for simplicity; in a real project, consider using CSS Modules or styled-components
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '40px',
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    marginBottom: '10px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    background: '#0070f3',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  info: {
    color: '#333',
    margin: '10px 0',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  datasetList: {
    listStyle: 'none',
    padding: 0,
  },
  datasetItem: {
    padding: '15px',
    marginBottom: '10px',
    background: '#fff',
    borderRadius: '6px',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '10px',
  },
  downloadButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: '#28a745',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default KaggleExplorer; 