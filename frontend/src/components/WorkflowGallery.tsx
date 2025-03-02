import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  AutoGraph as MetricsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Workflow {
  id: string;
  name: string;
  description: string;
  tags: string[];
  lastRun: string;
  status: 'success' | 'failed' | 'running' | 'idle';
  creator: {
    name: string;
    avatar: string;
  };
  collaborators: {
    name: string;
    avatar: string;
  }[];
  metrics: {
    runs: number;
    avgDuration: string;
    successRate: number;
  };
  favorite: boolean;
}

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Customer Churn Analysis',
    description: 'Analyze customer behavior patterns to predict churn risk',
    tags: ['ML', 'Analytics', 'Customer Data'],
    lastRun: '2024-03-15T10:30:00',
    status: 'success',
    creator: {
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?u=alex',
    },
    collaborators: [
      { name: 'Sarah Kim', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    ],
    metrics: {
      runs: 156,
      avgDuration: '45m',
      successRate: 98.5,
    },
    favorite: true,
  },
  {
    id: 'w2',
    name: 'Sales Forecasting Pipeline',
    description: 'Predict future sales using historical data and market trends',
    tags: ['Forecasting', 'Sales', 'Time Series'],
    lastRun: '2024-03-14T15:45:00',
    status: 'running',
    creator: {
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
    },
    collaborators: [
      { name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=david' },
    ],
    metrics: {
      runs: 89,
      avgDuration: '1h 15m',
      successRate: 95.2,
    },
    favorite: false,
  },
  // Add more sample workflows...
];

const WorkflowGallery: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workflowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedWorkflowId(workflowId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedWorkflowId(null);
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'failed':
        return theme.palette.error.main;
      case 'running':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const filteredWorkflows = SAMPLE_WORKFLOWS.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Workflow Gallery
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Create Workflow
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Browse, manage, and monitor your data workflows
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ borderRadius: 2 }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                sx={{ borderRadius: 2 }}
              >
                Sort
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Workflow Grid */}
      <Grid container spacing={3}>
        {filteredWorkflows.map((workflow) => (
          <Grid item xs={12} md={6} key={workflow.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {workflow.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workflow.description}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, workflow.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {workflow.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={workflow.creator.avatar}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {workflow.creator.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Creator
                      </Typography>
                    </Box>
                    <AvatarGroup max={3}>
                      {workflow.collaborators.map((collaborator) => (
                        <Avatar
                          key={collaborator.name}
                          src={collaborator.avatar}
                          sx={{ width: 24, height: 24 }}
                        />
                      ))}
                    </AvatarGroup>
                  </Box>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Runs
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {workflow.metrics.runs}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Avg. Duration
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {workflow.metrics.avgDuration}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Success Rate
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {workflow.metrics.successRate}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={workflow.status}
                      sx={{
                        bgcolor: alpha(getStatusColor(workflow.status), 0.1),
                        color: getStatusColor(workflow.status),
                        fontWeight: 'medium',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Last run: {new Date(workflow.lastRun).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    color={workflow.favorite ? 'warning' : 'default'}
                  >
                    <StarIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <PlayIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Workflow Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CloneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clone</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <MetricsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Metrics</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkflowGallery; 