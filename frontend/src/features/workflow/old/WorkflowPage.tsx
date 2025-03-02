import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Container, 
  AppBar, 
  Toolbar, 
  IconButton, 
  InputBase, 
  Tabs, 
  Tab, 
  Divider,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { fetchWorkflows } from '../../../api/workflows';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const WorkflowCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const WorkflowCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
}));

const WorkflowCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
}));

const WorkflowCardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2, 2),
}));

// Sample workflow data
const sampleWorkflows = [
  {
    id: '1',
    name: 'Data Cleaning Pipeline',
    description: 'A workflow to clean and preprocess data',
    tags: ['data cleaning', 'preprocessing'],
    lastModified: '2023-12-01',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Feature Engineering',
    description: 'A workflow to create new features',
    tags: ['feature engineering', 'preprocessing'],
    lastModified: '2023-11-28',
    status: 'idle',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Customer Segmentation',
    description: 'Segment customers based on behavior',
    tags: ['clustering', 'analysis'],
    lastModified: '2023-11-15',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Sales Prediction',
    description: 'Predict future sales based on historical data',
    tags: ['forecasting', 'machine learning'],
    lastModified: '2023-10-30',
    status: 'failed',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Customer Churn Analysis',
    description: 'Analyze factors affecting customer churn',
    tags: ['analysis', 'visualization'],
    lastModified: '2023-10-15',
    status: 'running',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Sentiment Analysis',
    description: 'Analyze customer feedback sentiment',
    tags: ['nlp', 'machine learning'],
    lastModified: '2023-09-28',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  }
];

// Main component
const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await fetchWorkflows();
        setWorkflows(data.length > 0 ? data : sampleWorkflows);
      } catch (error) {
        console.error('Error fetching workflows:', error);
        setWorkflows(sampleWorkflows);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleCreateWorkflow = () => {
    navigate('/workflow/new');
  };

  const handleWorkflowClick = (id: string) => {
    navigate(`/workflow/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'running':
        return '#2196f3';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
          >
            Data Whisperer
          </Typography>
          
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search workflows..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title="Help">
              <IconButton size="large" color="inherit">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="large" color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton size="large" edge="end" color="inherit">
                <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Secondary Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="workflow tabs"
          sx={{ px: 2 }}
        >
          <Tab label="All Workflows" />
          <Tab label="Recent" />
          <Tab label="Shared with me" />
          <Tab label="Favorites" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Header with actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {tabValue === 0 && "All Workflows"}
            {tabValue === 1 && "Recent Workflows"}
            {tabValue === 2 && "Shared Workflows"}
            {tabValue === 3 && "Favorite Workflows"}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={handleFilterOpen}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={handleFilterClose}>All</MenuItem>
              <MenuItem onClick={handleFilterClose}>Completed</MenuItem>
              <MenuItem onClick={handleFilterClose}>Running</MenuItem>
              <MenuItem onClick={handleFilterClose}>Failed</MenuItem>
              <MenuItem onClick={handleFilterClose}>Idle</MenuItem>
            </Menu>
            
            <Button 
              variant="outlined" 
              startIcon={<SortIcon />}
              onClick={handleSortOpen}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={handleSortClose}>Name (A-Z)</MenuItem>
              <MenuItem onClick={handleSortClose}>Name (Z-A)</MenuItem>
              <MenuItem onClick={handleSortClose}>Last Modified (Newest)</MenuItem>
              <MenuItem onClick={handleSortClose}>Last Modified (Oldest)</MenuItem>
            </Menu>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateWorkflow}
            >
              Create Workflow
            </Button>
          </Box>
        </Box>

        {/* Workflow Grid */}
        {loading ? (
          <Typography>Loading workflows...</Typography>
        ) : (
          <Grid container spacing={3}>
            {workflows.map((workflow) => (
              <Grid item key={workflow.id} xs={12} sm={6} md={4} lg={3}>
                <WorkflowCard onClick={() => handleWorkflowClick(workflow.id)}>
                  <WorkflowCardMedia
                    image={workflow.thumbnail || "https://source.unsplash.com/random?data"}
                    title={workflow.name}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        p: 0.5,
                      }}
                    >
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e);
                      }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </WorkflowCardMedia>
                  <WorkflowCardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {workflow.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {workflow.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                      {workflow.tags && workflow.tags.map((tag: string, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </WorkflowCardContent>
                  <Divider />
                  <WorkflowCardActions>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: getStatusColor(workflow.status),
                          mr: 1,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {workflow.lastModified ? new Date(workflow.lastModified).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </WorkflowCardActions>
                </WorkflowCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Menu for workflow card actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Duplicate</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add to favorites</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkflowPage;