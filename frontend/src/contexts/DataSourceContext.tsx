import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

// Type definitions for data sources
export interface DataSourceQuality {
  score: number; // 0-100
  missingValues: number; // count or percentage
  duplicates: number; // count or percentage
  outliers: number; // count or percentage
  lastUpdated?: Date;
}

export interface DataSchema {
  fields: {
    name: string;
    type: string;
    nullable: boolean;
    description?: string;
    required?: boolean;
  }[];
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'file' | 'api' | 'stream';
  format?: string;
  path?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastAccessed: Date | null;
  accessCount: number;
  tags: string[];
  quality: DataSourceQuality;
  schema: DataSchema;
  previewAvailable: boolean;
  favorite: boolean;
  config: Record<string, any>;
}

interface DataSourceContextType {
  dataSources: DataSource[];
  loading: boolean;
  error: string | null;
  selectedDataSource: DataSource | null;
  recentDataSources: DataSource[];
  favoriteDataSources: DataSource[];
  
  // Actions
  fetchDataSources: () => Promise<void>;
  getDataSourceById: (id: string) => DataSource | undefined;
  selectDataSource: (id: string) => void;
  toggleFavorite: (id: string) => void;
  searchDataSources: (query: string) => DataSource[];
  addDataSourceAccess: (id: string) => void;
  getDataSourcePreview: (id: string) => void;
}

// Create the context with a default empty value
const DataSourceContext = createContext<DataSourceContextType>({
  dataSources: [],
  loading: false,
  error: null,
  selectedDataSource: null,
  recentDataSources: [],
  favoriteDataSources: [],
  
  fetchDataSources: async () => {},
  getDataSourceById: () => undefined,
  selectDataSource: () => {},
  toggleFavorite: () => {},
  searchDataSources: () => [],
  addDataSourceAccess: () => {},
  getDataSourcePreview: () => {},
});

// Custom hook for using the context
export const useDataSources = () => useContext(DataSourceContext);

interface DataSourceProviderProps {
  children: ReactNode;
}

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  
  // Fetch data sources (mock implementation)
  const fetchDataSources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockDataSources: DataSource[] = [
        {
          id: '1',
          name: 'Customer Data',
          description: 'Customer information including demographics and purchase history',
          type: 'database',
          status: 'connected',
          lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          accessCount: 42,
          tags: ['customers', 'sales', 'demographics'],
          quality: {
            score: 92,
            missingValues: 12,
            duplicates: 0,
            outliers: 3
          },
          schema: {
            fields: [
              { name: 'customer_id', type: 'string', nullable: false, description: 'Unique customer identifier', required: true },
              { name: 'name', type: 'string', nullable: false, description: 'Customer full name', required: true },
              { name: 'email', type: 'string', nullable: false, description: 'Customer email address', required: true },
              { name: 'age', type: 'integer', nullable: true, description: 'Customer age in years', required: false },
              { name: 'signup_date', type: 'date', nullable: false, description: 'Date when customer signed up', required: true }
            ]
          },
          previewAvailable: true,
          favorite: true,
          config: {
            connectionString: 'postgres://user:password@localhost:5432/customers'
          }
        },
        {
          id: '2',
          name: 'Sales Data 2023',
          description: 'Annual sales data for fiscal year 2023',
          type: 'file',
          status: 'connected',
          lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          accessCount: 17,
          tags: ['sales', 'finance', '2023'],
          quality: {
            score: 87,
            missingValues: 24,
            duplicates: 2,
            outliers: 5
          },
          schema: {
            fields: [
              { name: 'transaction_id', type: 'string', nullable: false, description: 'Unique transaction identifier', required: true },
              { name: 'date', type: 'date', nullable: false, description: 'Transaction date', required: true },
              { name: 'product_id', type: 'string', nullable: false, description: 'Product identifier', required: true },
              { name: 'quantity', type: 'integer', nullable: false, description: 'Quantity sold', required: true },
              { name: 'price', type: 'decimal', nullable: false, description: 'Unit price', required: true },
              { name: 'customer_id', type: 'string', nullable: true, description: 'Customer identifier if available', required: false }
            ]
          },
          previewAvailable: true,
          favorite: false,
          config: {
            filePath: '/data/sales_2023.csv',
            format: 'csv'
          }
        },
        {
          id: '3',
          name: 'Product API',
          description: 'External API for product information and inventory',
          type: 'api',
          status: 'disconnected',
          lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          accessCount: 8,
          tags: ['products', 'inventory', 'api'],
          quality: {
            score: 65,
            missingValues: 56,
            duplicates: 0,
            outliers: 12
          },
          schema: {
            fields: [
              { name: 'product_id', type: 'string', nullable: false, description: 'Unique product identifier', required: true },
              { name: 'name', type: 'string', nullable: false, description: 'Product name', required: true },
              { name: 'category', type: 'string', nullable: true, description: 'Product category', required: false },
              { name: 'price', type: 'decimal', nullable: false, description: 'Current price', required: true },
              { name: 'inventory', type: 'integer', nullable: true, description: 'Current inventory level', required: false }
            ]
          },
          previewAvailable: false,
          favorite: true,
          config: {
            endpoint: 'https://api.example.com/products',
            apiKey: 'sk_12345'
          }
        }
      ];
      
      setDataSources(mockDataSources);
    } catch (err) {
      setError('Failed to fetch data sources. Please try again.');
      console.error('Error fetching data sources:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get data source by ID
  const getDataSourceById = (id: string) => {
    return dataSources.find(ds => ds.id === id);
  };
  
  // Select a data source
  const selectDataSource = (id: string) => {
    const dataSource = getDataSourceById(id);
    if (dataSource) {
      setSelectedDataSource(dataSource);
      addDataSourceAccess(id);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setDataSources(dataSources.map(ds => 
      ds.id === id ? { ...ds, favorite: !ds.favorite } : ds
    ));
  };
  
  // Search data sources
  const searchDataSources = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return dataSources.filter(ds => 
      ds.name.toLowerCase().includes(lowerQuery) ||
      ds.description.toLowerCase().includes(lowerQuery) ||
      ds.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };
  
  // Track data source access
  const addDataSourceAccess = (id: string) => {
    setDataSources(dataSources.map(ds => 
      ds.id === id 
        ? { 
            ...ds, 
            lastAccessed: new Date(), 
            accessCount: ds.accessCount + 1 
          } 
        : ds
    ));
  };
  
  // Get data source preview
  const getDataSourcePreview = (id: string) => {
    // In a real implementation, this would fetch preview data
    // For now, just track the access
    addDataSourceAccess(id);
  };
  
  // Fetch data sources on mount
  useEffect(() => {
    fetchDataSources();
  }, []);
  
  // Compute derived state
  const recentDataSources = [...dataSources]
    .filter(ds => ds.lastAccessed !== null)
    .sort((a, b) => {
      if (!a.lastAccessed || !b.lastAccessed) return 0;
      return b.lastAccessed.getTime() - a.lastAccessed.getTime();
    })
    .slice(0, 5);
  
  const favoriteDataSources = dataSources.filter(ds => ds.favorite);
  
  // Context value
  const contextValue: DataSourceContextType = {
    dataSources,
    loading,
    error,
    selectedDataSource,
    recentDataSources,
    favoriteDataSources,
    fetchDataSources,
    getDataSourceById,
    selectDataSource,
    toggleFavorite,
    searchDataSources,
    addDataSourceAccess,
    getDataSourcePreview
  };
  
  return (
    <DataSourceContext.Provider value={contextValue}>
      {children}
    </DataSourceContext.Provider>
  );
} 