import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Card, 
  Badge, 
  Button, 
  Tabs, 
  ActionIcon, 
  TextInput,
  Textarea,
  Modal,
  Stack,
  Grid,
  Loader,
  Box,
  Divider,
  ScrollArea,
  useMantineTheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconFolders, 
  IconDatabase, 
  IconBrain, 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconSearch,
  IconTag,
  IconCategory,
  IconArrowRight
} from '@tabler/icons-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Bucket {
  id: string;
  name: string;
  description: string;
  datasets: string[];
  created_at: string;
  updated_at: string;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  file_path: string;
  tags: string[];
  source: string;
  metadata: Record<string, any>;
  indexed_at: string;
  updated_at: string;
}

interface DatasetCatalog {
  id: string;
  description: string;
  tags: string[];
  category: string;
  ai_generated: boolean;
  confidence: number;
  cataloged_at: string;
  updated_at: string;
}

// API functions
const fetchBuckets = async (): Promise<Bucket[]> => {
  const response = await axios.get('/api/datasets/organization/buckets');
  return response.data;
};

const fetchDatasets = async (): Promise<Dataset[]> => {
  const response = await axios.get('/api/datasets/organization/index');
  return response.data;
};

const fetchCatalog = async (): Promise<Record<string, DatasetCatalog>> => {
  const response = await axios.get('/api/datasets/organization/catalog');
  return response.data.datasets || {};
};

const createBucket = async (data: { name: string; description: string }): Promise<Bucket> => {
  const response = await axios.post('/api/datasets/organization/buckets', data);
  return response.data;
};

const updateBucket = async ({ id, data }: { id: string; data: { name?: string; description?: string } }): Promise<Bucket> => {
  const response = await axios.put(`/api/datasets/organization/buckets/${id}`, data);
  return response.data;
};

const deleteBucket = async (id: string): Promise<void> => {
  await axios.delete(`/api/datasets/organization/buckets/${id}?force=false`);
};

const addDatasetToBucket = async ({ bucketId, datasetId }: { bucketId: string; datasetId: string }): Promise<void> => {
  await axios.post(`/api/datasets/organization/buckets/${bucketId}/datasets`, { dataset_id: datasetId });
};

const removeDatasetFromBucket = async ({ bucketId, datasetId }: { bucketId: string; datasetId: string }): Promise<void> => {
  await axios.delete(`/api/datasets/organization/buckets/${bucketId}/datasets/${datasetId}`);
};

const updateDatasetCatalog = async ({ 
  datasetId, 
  data 
}: { 
  datasetId: string; 
  data: { 
    description?: string; 
    tags?: string[]; 
    category?: string 
  } 
}): Promise<DatasetCatalog> => {
  const response = await axios.put(`/api/datasets/organization/catalog/${datasetId}`, data);
  return response.data;
};

// Components
const BucketCard: React.FC<{ 
  bucket: Bucket; 
  datasets: Dataset[];
  onEdit: (bucket: Bucket) => void;
  onDelete: (bucketId: string) => void;
  onAddDataset: (bucketId: string) => void;
  onRemoveDataset: (bucketId: string, datasetId: string) => void;
}> = ({ bucket, datasets, onEdit, onDelete, onAddDataset, onRemoveDataset }) => {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  
  // Filter datasets that are in this bucket
  const bucketDatasets = datasets.filter(dataset => bucket.datasets.includes(dataset.id));
  
  return (
    <>
      <Card withBorder shadow="sm" radius="md" p="md" mb="md">
        <Group justify="space-between" mb="xs">
          <Group>
            <IconFolders size={24} color={theme.colors.blue[6]} />
            <Title order={4}>{bucket.name}</Title>
          </Group>
          <Group>
            <Badge>{bucketDatasets.length} datasets</Badge>
            <ActionIcon variant="subtle" onClick={() => onEdit(bucket)}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(bucket.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
        
        <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
          {bucket.description || 'No description provided'}
        </Text>
        
        <Group justify="space-between" mt="md">
          <Text size="xs" c="dimmed">
            Updated: {new Date(bucket.updated_at).toLocaleString()}
          </Text>
          <Button size="xs" onClick={() => onAddDataset(bucket.id)}>
            Add Dataset
          </Button>
        </Group>
        
        {bucketDatasets.length > 0 && (
          <>
            <Divider my="sm" />
            <Button variant="subtle" size="xs" onClick={open} rightSection={<IconArrowRight size={14} />}>
              View Datasets
            </Button>
          </>
        )}
      </Card>
      
      <Modal opened={opened} onClose={close} title={`Datasets in ${bucket.name}`} size="lg">
        <ScrollArea h={400}>
          {bucketDatasets.map(dataset => (
            <Card key={dataset.id} withBorder shadow="sm" radius="md" p="md" mb="md">
              <Group justify="space-between">
                <Text fw={500}>{dataset.name}</Text>
                <ActionIcon variant="subtle" color="red" onClick={() => {
                  onRemoveDataset(bucket.id, dataset.id);
                  close();
                }}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
              <Text size="sm" c="dimmed" mt="xs">
                {dataset.description || 'No description provided'}
              </Text>
              <Group mt="md" gap="xs">
                {dataset.tags.map(tag => (
                  <Badge key={tag} size="sm">{tag}</Badge>
                ))}
              </Group>
            </Card>
          ))}
          
          {bucketDatasets.length === 0 && (
            <Text ta="center" c="dimmed" py="xl">No datasets in this bucket</Text>
          )}
        </ScrollArea>
      </Modal>
    </>
  );
};

const DatasetCard: React.FC<{ 
  dataset: Dataset; 
  catalog?: DatasetCatalog;
  onAddToBucket: (datasetId: string) => void;
  onUpdateCatalog: (datasetId: string) => void;
}> = ({ dataset, catalog, onAddToBucket, onUpdateCatalog }) => {
  const theme = useMantineTheme();
  
  return (
    <Card withBorder shadow="sm" radius="md" p="md" mb="md">
      <Group justify="space-between" mb="xs">
        <Group>
          <IconDatabase size={24} color={theme.colors.green[6]} />
          <Title order={4}>{dataset.name}</Title>
        </Group>
        <Group>
          <Badge color={dataset.source === 'kaggle' ? 'blue' : 'gray'}>{dataset.source}</Badge>
          <ActionIcon variant="subtle" onClick={() => onAddToBucket(dataset.id)}>
            <IconFolders size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" onClick={() => onUpdateCatalog(dataset.id)}>
            <IconBrain size={16} />
          </ActionIcon>
        </Group>
      </Group>
      
      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
        {dataset.description || 'No description provided'}
      </Text>
      
      {catalog && (
        <Box mb="md">
          <Group mb="xs">
            <IconCategory size={16} />
            <Text size="sm" fw={500}>Category: {catalog.category}</Text>
          </Group>
          
          <Group gap="xs" mb="xs">
            <IconTag size={16} />
            {catalog.tags.map(tag => (
              <Badge key={tag} size="sm">{tag}</Badge>
            ))}
          </Group>
          
          {catalog.ai_generated && (
            <Badge color="violet" size="sm">AI Cataloged</Badge>
          )}
        </Box>
      )}
      
      <Group justify="space-between" mt="md">
        <Text size="xs" c="dimmed">
          Indexed: {new Date(dataset.indexed_at).toLocaleString()}
        </Text>
        <Text size="xs" c="dimmed">
          Path: {dataset.file_path.split('/').pop()}
        </Text>
      </Group>
    </Card>
  );
};

// Main component
export function DatasetOrganizationPage() {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<string | null>('buckets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  
  // Modals
  const [bucketModalOpened, { open: openBucketModal, close: closeBucketModal }] = useDisclosure(false);
  const [datasetBucketModalOpened, { open: openDatasetBucketModal, close: closeDatasetBucketModal }] = useDisclosure(false);
  const [catalogModalOpened, { open: openCatalogModal, close: closeCatalogModal }] = useDisclosure(false);
  
  // Form state
  const [bucketForm, setBucketForm] = useState({ name: '', description: '' });
  const [catalogForm, setCatalogForm] = useState({ description: '', tags: '', category: '' });
  
  // Queries
  const { 
    data: buckets = [], 
    isLoading: isLoadingBuckets 
  } = useQuery({
    queryKey: ['buckets'],
    queryFn: fetchBuckets
  });
  
  const { 
    data: datasets = [], 
    isLoading: isLoadingDatasets 
  } = useQuery({
    queryKey: ['datasets'],
    queryFn: fetchDatasets
  });
  
  const { 
    data: catalog = {}, 
    isLoading: isLoadingCatalog 
  } = useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog
  });
  
  // Mutations
  const createBucketMutation = useMutation({
    mutationFn: createBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      notifications.show({
        title: 'Success',
        message: 'Bucket created successfully',
        color: 'green'
      });
      closeBucketModal();
      setBucketForm({ name: '', description: '' });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create bucket',
        color: 'red'
      });
    }
  });
  
  const updateBucketMutation = useMutation({
    mutationFn: updateBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      notifications.show({
        title: 'Success',
        message: 'Bucket updated successfully',
        color: 'green'
      });
      closeBucketModal();
      setSelectedBucket(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update bucket',
        color: 'red'
      });
    }
  });
  
  const deleteBucketMutation = useMutation({
    mutationFn: deleteBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      notifications.show({
        title: 'Success',
        message: 'Bucket deleted successfully',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete bucket. Make sure it is empty.',
        color: 'red'
      });
    }
  });
  
  const addDatasetToBucketMutation = useMutation({
    mutationFn: addDatasetToBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      notifications.show({
        title: 'Success',
        message: 'Dataset added to bucket successfully',
        color: 'green'
      });
      closeDatasetBucketModal();
      setSelectedDataset(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to add dataset to bucket',
        color: 'red'
      });
    }
  });
  
  const removeDatasetFromBucketMutation = useMutation({
    mutationFn: removeDatasetFromBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      notifications.show({
        title: 'Success',
        message: 'Dataset removed from bucket successfully',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove dataset from bucket',
        color: 'red'
      });
    }
  });
  
  const updateDatasetCatalogMutation = useMutation({
    mutationFn: updateDatasetCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      notifications.show({
        title: 'Success',
        message: 'Dataset catalog updated successfully',
        color: 'green'
      });
      closeCatalogModal();
      setSelectedDataset(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update dataset catalog',
        color: 'red'
      });
    }
  });
  
  // Handlers
  const handleCreateBucket = () => {
    if (!bucketForm.name) {
      notifications.show({
        title: 'Error',
        message: 'Bucket name is required',
        color: 'red'
      });
      return;
    }
    
    createBucketMutation.mutate(bucketForm);
  };
  
  const handleUpdateBucket = () => {
    if (!selectedBucket || !bucketForm.name) {
      notifications.show({
        title: 'Error',
        message: 'Bucket name is required',
        color: 'red'
      });
      return;
    }
    
    updateBucketMutation.mutate({
      id: selectedBucket.id,
      data: bucketForm
    });
  };
  
  const handleEditBucket = (bucket: Bucket) => {
    setSelectedBucket(bucket);
    setBucketForm({
      name: bucket.name,
      description: bucket.description
    });
    openBucketModal();
  };
  
  const handleDeleteBucket = (bucketId: string) => {
    if (window.confirm('Are you sure you want to delete this bucket?')) {
      deleteBucketMutation.mutate(bucketId);
    }
  };
  
  const handleAddDatasetToBucket = (bucketId: string) => {
    setSelectedBucket(buckets.find(b => b.id === bucketId) || null);
    openDatasetBucketModal();
  };
  
  const handleSelectDatasetForBucket = (datasetId: string) => {
    if (!selectedBucket) return;
    
    addDatasetToBucketMutation.mutate({
      bucketId: selectedBucket.id,
      datasetId
    });
  };
  
  const handleRemoveDatasetFromBucket = (bucketId: string, datasetId: string) => {
    removeDatasetFromBucketMutation.mutate({
      bucketId,
      datasetId
    });
  };
  
  const handleDatasetAddToBucket = (datasetId: string) => {
    setSelectedDataset(datasets.find(d => d.id === datasetId) || null);
    openDatasetBucketModal();
  };
  
  const handleSelectBucketForDataset = (bucketId: string) => {
    if (!selectedDataset) return;
    
    addDatasetToBucketMutation.mutate({
      bucketId,
      datasetId: selectedDataset.id
    });
  };
  
  const handleUpdateCatalog = (datasetId: string) => {
    setSelectedDataset(datasets.find(d => d.id === datasetId) || null);
    
    // Get existing catalog data if available
    const existingCatalog = catalog[datasetId];
    if (existingCatalog) {
      setCatalogForm({
        description: existingCatalog.description || '',
        tags: existingCatalog.tags.join(', ') || '',
        category: existingCatalog.category || ''
      });
    } else {
      setCatalogForm({ description: '', tags: '', category: '' });
    }
    
    openCatalogModal();
  };
  
  const handleSaveCatalog = () => {
    if (!selectedDataset) return;
    
    updateDatasetCatalogMutation.mutate({
      datasetId: selectedDataset.id,
      data: {
        description: catalogForm.description,
        tags: catalogForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: catalogForm.category
      }
    });
  };
  
  // Filter datasets based on search query
  const filteredDatasets = datasets.filter(dataset => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      dataset.name.toLowerCase().includes(query) ||
      (dataset.description && dataset.description.toLowerCase().includes(query)) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (catalog[dataset.id]?.category && catalog[dataset.id].category.toLowerCase().includes(query))
    );
  });
  
  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="md">Dataset Organization</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="buckets" leftSection={<IconFolders size={16} />}>
            Buckets
          </Tabs.Tab>
          <Tabs.Tab value="datasets" leftSection={<IconDatabase size={16} />}>
            Datasets
          </Tabs.Tab>
          <Tabs.Tab value="catalog" leftSection={<IconBrain size={16} />}>
            AI Catalog
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      
      {activeTab === 'buckets' && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Buckets</Title>
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={() => {
                setSelectedBucket(null);
                setBucketForm({ name: '', description: '' });
                openBucketModal();
              }}
            >
              Create Bucket
            </Button>
          </Group>
          
          {isLoadingBuckets ? (
            <Box ta="center" py="xl">
              <Loader />
            </Box>
          ) : (
            <Grid>
              {buckets.map(bucket => (
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={bucket.id}>
                  <BucketCard 
                    bucket={bucket} 
                    datasets={datasets}
                    onEdit={handleEditBucket}
                    onDelete={handleDeleteBucket}
                    onAddDataset={handleAddDatasetToBucket}
                    onRemoveDataset={handleRemoveDatasetFromBucket}
                  />
                </Grid.Col>
              ))}
              
              {buckets.length === 0 && (
                <Grid.Col span={12}>
                  <Text ta="center" c="dimmed" py="xl">No buckets found. Create your first bucket to organize your datasets.</Text>
                </Grid.Col>
              )}
            </Grid>
          )}
        </>
      )}
      
      {activeTab === 'datasets' && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Datasets</Title>
            <TextInput
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightSection={<IconSearch size={16} />}
              w={300}
            />
          </Group>
          
          {isLoadingDatasets ? (
            <Box ta="center" py="xl">
              <Loader />
            </Box>
          ) : (
            <Grid>
              {filteredDatasets.map(dataset => (
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={dataset.id}>
                  <DatasetCard 
                    dataset={dataset} 
                    catalog={catalog[dataset.id]}
                    onAddToBucket={handleDatasetAddToBucket}
                    onUpdateCatalog={handleUpdateCatalog}
                  />
                </Grid.Col>
              ))}
              
              {filteredDatasets.length === 0 && (
                <Grid.Col span={12}>
                  <Text ta="center" c="dimmed" py="xl">
                    {searchQuery ? 'No datasets match your search query.' : 'No datasets found.'}
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          )}
        </>
      )}
      
      {activeTab === 'catalog' && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>AI Catalog</Title>
            <TextInput
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightSection={<IconSearch size={16} />}
              w={300}
            />
          </Group>
          
          {isLoadingCatalog ? (
            <Box ta="center" py="xl">
              <Loader />
            </Box>
          ) : (
            <Grid>
              {filteredDatasets
                .filter(dataset => catalog[dataset.id])
                .map(dataset => (
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={dataset.id}>
                    <DatasetCard 
                      dataset={dataset} 
                      catalog={catalog[dataset.id]}
                      onAddToBucket={handleDatasetAddToBucket}
                      onUpdateCatalog={handleUpdateCatalog}
                    />
                  </Grid.Col>
                ))
              }
              
              {filteredDatasets.filter(dataset => catalog[dataset.id]).length === 0 && (
                <Grid.Col span={12}>
                  <Text ta="center" c="dimmed" py="xl">
                    {searchQuery 
                      ? 'No cataloged datasets match your search query.' 
                      : 'No cataloged datasets found. Update dataset catalogs to organize them better.'}
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          )}
        </>
      )}
      
      {/* Bucket Modal */}
      <Modal 
        opened={bucketModalOpened} 
        onClose={closeBucketModal} 
        title={selectedBucket ? 'Edit Bucket' : 'Create Bucket'}
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Enter bucket name"
            value={bucketForm.name}
            onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value })}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter bucket description"
            value={bucketForm.description}
            onChange={(e) => setBucketForm({ ...bucketForm, description: e.target.value })}
            minRows={3}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeBucketModal}>Cancel</Button>
            <Button onClick={selectedBucket ? handleUpdateBucket : handleCreateBucket}>
              {selectedBucket ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      {/* Dataset to Bucket Modal */}
      <Modal 
        opened={datasetBucketModalOpened} 
        onClose={closeDatasetBucketModal} 
        title={selectedBucket 
          ? `Add Dataset to ${selectedBucket.name}` 
          : selectedDataset 
            ? `Add ${selectedDataset.name} to Bucket` 
            : 'Add Dataset to Bucket'
        }
        size="lg"
      >
        <ScrollArea h={400}>
          {selectedBucket && (
            <>
              <Text mb="md">Select a dataset to add to this bucket:</Text>
              {datasets
                .filter(dataset => !selectedBucket.datasets.includes(dataset.id))
                .map(dataset => (
                  <Card key={dataset.id} withBorder shadow="sm" radius="md" p="md" mb="md">
                    <Group justify="space-between">
                      <Text fw={500}>{dataset.name}</Text>
                      <Button size="xs" onClick={() => handleSelectDatasetForBucket(dataset.id)}>
                        Add
                      </Button>
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {dataset.description || 'No description provided'}
                    </Text>
                  </Card>
                ))
              }
              
              {datasets.filter(dataset => !selectedBucket.datasets.includes(dataset.id)).length === 0 && (
                <Text ta="center" c="dimmed" py="xl">All datasets are already in this bucket</Text>
              )}
            </>
          )}
          
          {selectedDataset && !selectedBucket && (
            <>
              <Text mb="md">Select a bucket to add this dataset to:</Text>
              {buckets
                .filter(bucket => !bucket.datasets.includes(selectedDataset.id))
                .map(bucket => (
                  <Card key={bucket.id} withBorder shadow="sm" radius="md" p="md" mb="md">
                    <Group justify="space-between">
                      <Text fw={500}>{bucket.name}</Text>
                      <Button size="xs" onClick={() => handleSelectBucketForDataset(bucket.id)}>
                        Add
                      </Button>
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {bucket.description || 'No description provided'}
                    </Text>
                  </Card>
                ))
              }
              
              {buckets.filter(bucket => !bucket.datasets.includes(selectedDataset.id)).length === 0 && (
                <Text ta="center" c="dimmed" py="xl">This dataset is already in all buckets</Text>
              )}
            </>
          )}
        </ScrollArea>
      </Modal>
      
      {/* Catalog Modal */}
      <Modal 
        opened={catalogModalOpened} 
        onClose={closeCatalogModal} 
        title={selectedDataset ? `Update Catalog for ${selectedDataset.name}` : 'Update Catalog'}
      >
        <Stack>
          <Textarea
            label="Description"
            placeholder="Enter dataset description"
            value={catalogForm.description}
            onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
            minRows={3}
          />
          
          <TextInput
            label="Tags"
            placeholder="Enter tags separated by commas"
            value={catalogForm.tags}
            onChange={(e) => setCatalogForm({ ...catalogForm, tags: e.target.value })}
          />
          
          <TextInput
            label="Category"
            placeholder="Enter dataset category"
            value={catalogForm.category}
            onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeCatalogModal}>Cancel</Button>
            <Button onClick={handleSaveCatalog}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default DatasetOrganizationPage; 