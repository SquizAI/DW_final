import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Code as CodeIcon,
  DataObject as DataIcon,
  Analytics as AnalyticsIcon,
  Build as BuildIcon,
  Psychology as PsychologyIcon,
  AutoFixHigh as AIIcon,
  Add as AddIcon,
  PlayArrow as RunIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  capabilities: string[];
  usageCount: number;
  rating: number;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

const TOOL_CATEGORIES = [
  { id: 'data', label: 'Data Processing', icon: <DataIcon /> },
  { id: 'analysis', label: 'Analysis', icon: <AnalyticsIcon /> },
  { id: 'visualization', label: 'Visualization', icon: <BuildIcon /> },
  { id: 'ai', label: 'AI & ML', icon: <PsychologyIcon /> },
  { id: 'code', label: 'Code Generation', icon: <CodeIcon /> },
];

const SAMPLE_TOOLS: Tool[] = [
  {
    id: 'data-loader',
    name: 'Data Loader',
    description: 'Load and preprocess datasets from various sources',
    category: 'data',
    icon: <DataIcon />,
    capabilities: ['CSV', 'JSON', 'SQL', 'API'],
    usageCount: 1250,
    rating: 4.8,
    parameters: [
      {
        name: 'source',
        type: 'string',
        description: 'Data source URL or path',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Data format (csv, json, etc.)',
        required: true,
      },
    ],
  },
  {
    id: 'data-profiler',
    name: 'Data Profiler',
    description: 'Generate comprehensive data quality reports',
    category: 'analysis',
    icon: <AnalyticsIcon />,
    capabilities: ['Quality Analysis', 'Statistics', 'Visualization'],
    usageCount: 850,
    rating: 4.6,
    parameters: [
      {
        name: 'dataset',
        type: 'DataFrame',
        description: 'Input dataset to analyze',
        required: true,
      },
    ],
  },
  // Add more tools...
];

const AIToolGarden: React.FC = () => {
  const theme = useTheme();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = SAMPLE_TOOLS.filter(tool => 
    (!selectedCategory || tool.category === selectedCategory) &&
    (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          AI Tool Garden
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and utilize powerful AI tools for your workflows
        </Typography>
      </Box>

      {/* Search and Categories */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {TOOL_CATEGORIES.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tool Grid */}
      <Grid container spacing={3}>
        {filteredTools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => setSelectedTool(tool)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        mr: 2,
                      }}
                    >
                      {tool.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {tool.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={capability}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: theme.palette.warning.main, mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {tool.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {tool.usageCount} uses
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Tool Details Dialog */}
      <Dialog
        open={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        {selectedTool && (
          <>
            <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), pb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  {selectedTool.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedTool.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTool.description}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Parameters
                  </Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                    <List disablePadding>
                      {selectedTool.parameters.map((param, index) => (
                        <React.Fragment key={param.name}>
                          {index > 0 && <Divider />}
                          <ListItem sx={{ py: 2 }}>
                            <ListItemIcon>
                              <InfoIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography fontWeight="medium">
                                    {param.name}
                                  </Typography>
                                  {param.required && (
                                    <Chip
                                      label="Required"
                                      size="small"
                                      color="error"
                                      sx={{ height: 20 }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Type: {param.type}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {param.description}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Capabilities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTool.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={capability}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Statistics
                    </Typography>
                    <List disablePadding>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Usage Count"
                          secondary={selectedTool.usageCount}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Rating"
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarIcon
                                sx={{ color: theme.palette.warning.main, mr: 0.5 }}
                              />
                              {selectedTool.rating}
                            </Box>
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setSelectedTool(null)}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add to Workflow
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<RunIcon />}
                sx={{ borderRadius: 2 }}
              >
                Run Tool
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AIToolGarden; 