import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Material UI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ReorderIcon from '@mui/icons-material/Reorder';

// DnD Kit
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Hooks & Components
import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useSubmodules } from '../../hooks/useSubmodules';
import { useContents } from '../../hooks/useContents';
import { useUI } from '../../context/UIContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import SortableItem from '../../components/SortableItem';

// Dialogs
import ModuleDialog from './components/ModuleDialog';
import SubmoduleDialog from './components/SubmoduleDialog';
import { getIconComponent } from '../../utils/iconHelper';

const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useUI();

  // Queries
  const { useList: useCoursesList, useDelete: useCourseDelete } = useCourses();
  const { data: courses = [], isLoading: isCoursesLoading } = useCoursesList();
  const courseDeleteMutation = useCourseDelete();

  const { useList: useModulesList, useCreate: useModuleCreate, useUpdate: useModuleUpdate, useDelete: useModuleDelete, useReorder: useModuleReorder } = useModules();
  const { data: modules = [], isLoading: isModulesLoading } = useModulesList();
  const moduleCreateMutation = useModuleCreate();
  const moduleUpdateMutation = useModuleUpdate();
  const moduleDeleteMutation = useModuleDelete();
  const moduleReorderMutation = useModuleReorder();

  const { useList: useSubmodulesList, useCreate: useSubmoduleCreate, useUpdate: useSubmoduleUpdate, useDelete: useSubmoduleDelete, useReorder: useSubmoduleReorder } = useSubmodules();
  const { data: submodules = [], isLoading: isSubmodulesLoading } = useSubmodulesList();
  const submoduleCreateMutation = useSubmoduleCreate();
  const submoduleUpdateMutation = useSubmoduleUpdate();
  const submoduleDeleteMutation = useSubmoduleDelete();
  const submoduleReorderMutation = useSubmoduleReorder();

  const { useList: useContentsList, useDelete: useContentDelete, useReorder: useContentReorder } = useContents();
  const { data: contents = [], isLoading: isContentsLoading } = useContentsList();
  const contentDeleteMutation = useContentDelete();
  const contentReorderMutation = useContentReorder();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Reorder mode states (per-item toggling)
  const [reorderModulesCourseId, setReorderModulesCourseId] = useState(null);
  const [reorderSubmodulesModuleId, setReorderSubmodulesModuleId] = useState(null);
  const [reorderContentsSubmoduleId, setReorderContentsSubmoduleId] = useState(null);

  // Modal forms states
  const [moduleModal, setModuleModal] = useState({ open: false, courseId: null, data: null });
  const [submoduleModal, setSubmoduleModal] = useState({ open: false, moduleId: null, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', parentId: '' });

  const isLoading = isCoursesLoading || isModulesLoading || isSubmodulesLoading || isContentsLoading;

  // --- Deletion validation and execution ---
  const triggerDelete = (type, id, parentId = '') => {
    setDeleteDialog({ open: true, type, id, parentId });
  };

  const handleConfirmDelete = async () => {
    const { type, id, parentId } = deleteDialog;
    try {
      if (type === 'course') {
        const hasModules = modules.some((m) => m.courseId === id);
        if (hasModules) {
          showToast('Cannot delete Course: Please delete all modules inside the course first.', 'error');
          return;
        }
        await courseDeleteMutation.mutateAsync(id);
      } else if (type === 'module') {
        const hasSubmodules = submodules.some((s) => s.moduleId === id);
        if (hasSubmodules) {
          showToast('Cannot delete Module: Please delete all submodules inside the module first.', 'error');
          return;
        }
        await moduleDeleteMutation.mutateAsync({ id, courseId: parentId });
      } else if (type === 'submodule') {
        const hasContents = contents.some((c) => c.submoduleId === id);
        if (hasContents) {
          showToast('Cannot delete Submodule: Please delete all content attachments inside the submodule first.', 'error');
          return;
        }
        await submoduleDeleteMutation.mutateAsync({ id, moduleId: parentId });
      } else if (type === 'content') {
        await contentDeleteMutation.mutateAsync({ id, submoduleId: parentId });
      }
    } catch (e) {
      // Toast handles automatically
    } finally {
      setDeleteDialog({ open: false, type: '', id: '', parentId: '' });
    }
  };

  // --- Drag & Drop Reordering Handlers ---
  const handleModuleDragEnd = async (event, courseId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const courseModules = modules.filter((m) => m.courseId === courseId).sort((a, b) => a.position - b.position);
    const oldIndex = courseModules.findIndex((m) => m.id === active.id);
    const newIndex = courseModules.findIndex((m) => m.id === over.id);

    const reordered = arrayMove(courseModules, oldIndex, newIndex);
    const orderedIds = reordered.map((m) => m.id);

    // Optimistically update
    const updatedModules = modules.map((m) => {
      const idx = orderedIds.indexOf(m.id);
      return idx !== -1 ? { ...m, position: idx + 1 } : m;
    }).sort((a, b) => a.position - b.position);
    queryClient.setQueryData(['modules'], updatedModules);

    try {
      await moduleReorderMutation.mutateAsync({ orderedIds, courseId });
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    } finally {
      setReorderModulesCourseId(null);
    }
  };

  const handleSubmoduleDragEnd = async (event, moduleId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const moduleSubs = submodules.filter((s) => s.moduleId === moduleId).sort((a, b) => a.position - b.position);
    const oldIndex = moduleSubs.findIndex((s) => s.id === active.id);
    const newIndex = moduleSubs.findIndex((s) => s.id === over.id);

    const reorderedSubs = arrayMove(moduleSubs, oldIndex, newIndex);
    const orderedIds = reorderedSubs.map((s) => s.id);

    // Optimistically update
    const updatedSubmodules = submodules.map((s) => {
      const idx = orderedIds.indexOf(s.id);
      return idx !== -1 ? { ...s, position: idx + 1 } : s;
    }).sort((a, b) => a.position - b.position);
    queryClient.setQueryData(['submodules'], updatedSubmodules);

    try {
      await submoduleReorderMutation.mutateAsync({ orderedIds, moduleId });
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ['submodules'] });
    } finally {
      setReorderSubmodulesModuleId(null);
    }
  };

  const handleContentDragEnd = async (event, submoduleId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const subContents = contents.filter((c) => c.submoduleId === submoduleId).sort((a, b) => a.position - b.position);
    const oldIndex = subContents.findIndex((c) => c.id === active.id);
    const newIndex = subContents.findIndex((c) => c.id === over.id);

    const reorderedContents = arrayMove(subContents, oldIndex, newIndex);
    const orderedIds = reorderedContents.map((c) => c.id);

    // Optimistically update
    const updatedContents = contents.map((c) => {
      const idx = orderedIds.indexOf(c.id);
      return idx !== -1 ? { ...c, position: idx + 1 } : c;
    }).sort((a, b) => a.position - b.position);
    queryClient.setQueryData(['contents'], updatedContents);

    try {
      await contentReorderMutation.mutateAsync({ orderedIds, submoduleId });
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    } finally {
      setReorderContentsSubmoduleId(null);
    }
  };

  // --- Modal Form Save Handlers ---
  const handleSaveModule = async (data) => {
    try {
      if (moduleModal.data) {
        await moduleUpdateMutation.mutateAsync({ ...moduleModal.data, ...data });
      } else {
        await moduleCreateMutation.mutateAsync(data);
      }
      setModuleModal({ open: false, courseId: null, data: null });
    } catch (e) {
      // Handled by react query
    }
  };

  const handleSaveSubmodule = async (data) => {
    try {
      if (submoduleModal.data) {
        await submoduleUpdateMutation.mutateAsync({ ...submoduleModal.data, ...data });
      } else {
        await submoduleCreateMutation.mutateAsync(data);
      }
      setSubmoduleModal({ open: false, moduleId: null, data: null });
    } catch (e) {
      // Handled by react query
    }
  };

  // Filtering
  const filteredCourses = courses.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.slug && row.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Panel */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MenuBookIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Courses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage LMS training courses and syllabus hierarchy (Category → Course → Module → Submodule → Content)
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => navigate('/course/add')}
        >
          Add Course
        </Button>
      </Box>

      {/* Filters Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, category, slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 360, width: '100%', backgroundColor: 'background.paper' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140, backgroundColor: 'background.paper' }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* Accordion Tree Stack */}
      {filteredCourses.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
          <Typography color="text.secondary" variant="body1">
            No courses found matching filter criteria.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCourses.map((course) => {
            const courseMods = modules.filter((m) => m.courseId === course.id).sort((a, b) => a.position - b.position);

            return (
              <Accordion
                key={course.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  borderLeft: `6px solid ${course.brandColor || '#6C1D5F'}`,
                }}
              >
                {/* Accordion Header (Course Summary) */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container spacing={2} alignItems="center" sx={{ pr: 2 }}>
                    <Grid item xs={12} sm={1.5} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          backgroundColor: course.brandColor || '#1A73E8',
                          color: '#FFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: 'none',
                        }}
                      >
                        {getIconComponent(course.icon, { sx: { fontSize: 24 } })}
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={9} md={9}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ fontFamily: '"Outfit", sans-serif' }}>
                          {course.name}
                        </Typography>
                        <Chip label={course.categoryName} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, color: '#FFF', backgroundColor: course.brandColor || '#6C1D5F' }} />
                        <Chip label="ACTIVE" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(46, 125, 50, 0.08)', border: '1px solid rgba(46, 125, 50, 0.3)', color: '#2e7d32' }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip label={course.level} size="small" sx={{ height: 20, fontSize: '0.7rem', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
                        <Chip label={course.language} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={course.estimatedDuration} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={`URL: ${course.slug}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: course.brandColor || '#1A73E8', border: '1px solid', borderColor: 'divider', ml: 0.5 }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={1.5} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Workspace">
                        <IconButton size="small" onClick={() => navigate(`/course/view/${course.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Course Details">
                        <IconButton size="small" onClick={() => navigate(`/course/edit/${course.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton size="small" color="error" onClick={() => triggerDelete('course', course.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover' }}>
                  {/* Course Details Header Card */}
                  <Card sx={{ mb: 4, p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Grid container spacing={3}>
                      {/* Left: Thumbnail Image */}
                      <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Box
                          component="img"
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80'}
                          alt={course.name}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      </Grid>

                      {/* Right: Description & Grid Fields */}
                      <Grid item xs={12} sm={8} md={9}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, fontSize: '0.875rem' }}>
                          {course.description || 'No description supplied for this course yet.'}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Integrated URL Slug
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {course.slug || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Level
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {course.level || 'Beginner'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Estimated Duration
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {course.estimatedDuration || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Icon
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {course.icon || 'School'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Language
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {course.language || 'English'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Brand Color
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: course.brandColor || '#6C1D5F', border: '1px solid', borderColor: 'divider' }} />
                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                  {course.brandColor || '#6C1D5F'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Modules CRUD Panel */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LibraryBooksIcon sx={{ color: course.brandColor || '#6C1D5F' }} /> Modules Syllabus
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant={reorderModulesCourseId === course.id ? 'contained' : 'outlined'}
                        startIcon={<ReorderIcon />}
                        onClick={() => setReorderModulesCourseId(reorderModulesCourseId === course.id ? null : course.id)}
                        size="small"
                        sx={{
                          borderColor: course.brandColor || '#6C1D5F',
                          color: reorderModulesCourseId === course.id ? '#FFF' : (course.brandColor || '#6C1D5F'),
                          backgroundColor: reorderModulesCourseId === course.id ? (course.brandColor || '#6C1D5F') : 'transparent',
                          '&:hover': {
                            borderColor: course.brandColor || '#6C1D5F',
                            backgroundColor: reorderModulesCourseId === course.id 
                              ? (course.brandColor ? `${course.brandColor}D0` : '#5a184e') 
                              : (course.brandColor ? `${course.brandColor}10` : 'rgba(108, 29, 95, 0.04)'),
                          }
                        }}
                      >
                        {reorderModulesCourseId === course.id ? 'Exit Reorder' : 'Reorder Modules'}
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setModuleModal({ open: true, courseId: course.id, data: null })}
                        size="small"
                        sx={{
                          backgroundColor: course.brandColor || '#6C1D5F',
                          '&:hover': {
                            backgroundColor: course.brandColor ? `${course.brandColor}D0` : '#5a184e',
                          }
                        }}
                      >
                        Add Module
                      </Button>
                    </Box>
                  </Box>

                  {/* Modules render list */}
                  {courseMods.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', backgroundColor: 'background.paper' }}>
                      <Typography color="text.secondary" variant="body2">
                        No modules created yet. Add a module to start building the syllabus.
                      </Typography>
                    </Card>
                  ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleModuleDragEnd(e, course.id)}>
                      <SortableContext items={courseMods.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {courseMods.map((mod) => {
                            const modSubs = submodules.filter((s) => s.moduleId === mod.id).sort((a, b) => a.position - b.position);

                            return (
                              <SortableItem key={mod.id} id={mod.id} handle={reorderModulesCourseId !== course.id}>
                                {({ attributes, listeners }) => (
                                  <Accordion
                                    sx={{
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1.5,
                                      boxShadow: 'none',
                                      '&:before': { display: 'none' },
                                      borderLeft: `4px solid ${mod.brandColor || '#6C1D5F'}`,
                                    }}
                                  >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, pr: 2 }}>
                                        {reorderModulesCourseId === course.id && (
                                          <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                            <DragIndicatorIcon color="action" />
                                          </Box>
                                        )}
                                        <Box sx={{ flexGrow: 1 }}>
                                          <Typography variant="subtitle2" fontWeight={700}>
                                            {mod.name}
                                          </Typography>
                                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Chip label={`Slug: ${mod.slug}`} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                            <Chip label={mod.level} size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: mod.brandColor || course.brandColor || '#6C1D5F', color: '#FFF', fontWeight: 600 }} />
                                            <Chip label={mod.language} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                            <Chip label={mod.estimatedDuration} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                            {mod.icon && <Chip label={`Icon: ${mod.icon}`} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />}
                                          </Box>
                                        </Box>
                                        <Box onClick={(e) => e.stopPropagation()}>
                                          <Tooltip title="Edit Module">
                                            <IconButton size="small" onClick={() => setModuleModal({ open: true, courseId: course.id, data: mod })}>
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Delete Module">
                                            <IconButton size="small" color="error" onClick={() => triggerDelete('module', mod.id, course.id)}>
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
                                      {/* Submodules CRUD Toolbar */}
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <SubtitlesIcon fontSize="small" sx={{ color: mod.brandColor || course.brandColor || '#6C1D5F' }} /> Submodules
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Button
                                            variant="text"
                                            size="small"
                                            startIcon={<ReorderIcon />}
                                            onClick={() => setReorderSubmodulesModuleId(reorderSubmodulesModuleId === mod.id ? null : mod.id)}
                                            sx={{
                                              fontSize: '0.75rem',
                                              color: reorderSubmodulesModuleId === mod.id ? '#FFF' : (mod.brandColor || course.brandColor || '#6C1D5F'),
                                              backgroundColor: reorderSubmodulesModuleId === mod.id ? (mod.brandColor || course.brandColor || '#6C1D5F') : 'transparent',
                                              '&:hover': {
                                                backgroundColor: reorderSubmodulesModuleId === mod.id 
                                                  ? (mod.brandColor ? `${mod.brandColor}D0` : (course.brandColor ? `${course.brandColor}D0` : '#5a184e')) 
                                                  : (mod.brandColor ? `${mod.brandColor}10` : (course.brandColor ? `${course.brandColor}10` : 'rgba(108, 29, 95, 0.04)')),
                                              }
                                            }}
                                          >
                                            {reorderSubmodulesModuleId === mod.id ? 'Exit Reorder' : 'Reorder'}
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => setSubmoduleModal({ open: true, moduleId: mod.id, data: null })}
                                            sx={{
                                              fontSize: '0.75rem',
                                              borderColor: mod.brandColor || course.brandColor || '#6C1D5F',
                                              color: mod.brandColor || course.brandColor || '#6C1D5F',
                                              '&:hover': {
                                                borderColor: mod.brandColor || course.brandColor || '#6C1D5F',
                                                backgroundColor: mod.brandColor ? `${mod.brandColor}10` : (course.brandColor ? `${course.brandColor}10` : 'rgba(108, 29, 95, 0.04)'),
                                              }
                                            }}
                                          >
                                            Add Submodule
                                          </Button>
                                        </Box>
                                      </Box>

                                      {/* Submodules render list */}
                                      {modSubs.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                          No submodules added yet.
                                        </Typography>
                                      ) : (
                                        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleSubmoduleDragEnd(e, mod.id)}>
                                          <SortableContext items={modSubs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                              {modSubs.map((sub) => {
                                                const subContents = contents.filter((c) => c.submoduleId === sub.id).sort((a, b) => a.position - b.position);

                                                return (
                                                  <SortableItem key={sub.id} id={sub.id} handle={reorderSubmodulesModuleId !== mod.id}>
                                                    {({ attributes: sAttr, listeners: sList }) => (
                                                      <Box
                                                        sx={{
                                                          border: '1px solid',
                                                          borderColor: 'divider',
                                                          borderRadius: 1.5,
                                                          p: 2,
                                                          backgroundColor: 'background.paper',
                                                          borderLeft: `4px solid ${sub.brandColor || '#6C1D5F'}`,
                                                        }}
                                                      >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                          {reorderSubmodulesModuleId === mod.id && (
                                                            <Box {...sAttr} {...sList} sx={{ cursor: 'grab', display: 'flex' }}>
                                                              <DragIndicatorIcon color="action" />
                                                            </Box>
                                                          )}
                                                          <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" fontWeight={700}>
                                                              {sub.name}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                                              <Chip label={`Slug: ${sub.slug}`} size="small" variant="outlined" sx={{ height: 14, fontSize: '0.55rem' }} />
                                                              <Chip label={sub.level} size="small" sx={{ height: 14, fontSize: '0.55rem', backgroundColor: sub.brandColor || mod.brandColor || course.brandColor || '#6C1D5F', color: '#FFF', fontWeight: 600 }} />
                                                              <Chip label={sub.language} size="small" variant="outlined" sx={{ height: 14, fontSize: '0.55rem' }} />
                                                              <Chip label={sub.estimatedDuration} size="small" variant="outlined" sx={{ height: 14, fontSize: '0.55rem' }} />
                                                              {sub.icon && <Chip label={`Icon: ${sub.icon}`} size="small" variant="outlined" sx={{ height: 14, fontSize: '0.55rem' }} />}
                                                            </Box>
                                                          </Box>
                                                          <Box>
                                                            <Tooltip title="Edit Submodule">
                                                              <IconButton size="small" onClick={() => setSubmoduleModal({ open: true, moduleId: mod.id, data: sub })}>
                                                                <EditIcon fontSize="small" />
                                                              </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Submodule">
                                                              <IconButton size="small" color="error" onClick={() => triggerDelete('submodule', sub.id, mod.id)}>
                                                                <DeleteIcon fontSize="small" />
                                                              </IconButton>
                                                            </Tooltip>
                                                          </Box>
                                                        </Box>

                                                        {/* Contents CRUD Toolbar */}
                                                        <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                              Learning Materials
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                              <Button
                                                                variant="text"
                                                                size="small"
                                                                onClick={() => setReorderContentsSubmoduleId(reorderContentsSubmoduleId === sub.id ? null : sub.id)}
                                                                sx={{
                                                                  fontSize: '0.75rem',
                                                                  py: 0,
                                                                  color: reorderContentsSubmoduleId === sub.id ? '#FFF' : (sub.brandColor || mod.brandColor || course.brandColor || '#6C1D5F'),
                                                                  backgroundColor: reorderContentsSubmoduleId === sub.id ? (sub.brandColor || mod.brandColor || course.brandColor || '#6C1D5F') : 'transparent',
                                                                  '&:hover': {
                                                                    backgroundColor: reorderContentsSubmoduleId === sub.id 
                                                                      ? (sub.brandColor ? `${sub.brandColor}D0` : (mod.brandColor ? `${mod.brandColor}D0` : '#5a184e')) 
                                                                      : (sub.brandColor ? `${sub.brandColor}10` : (mod.brandColor ? `${mod.brandColor}10` : 'rgba(108, 29, 95, 0.04)')),
                                                                  }
                                                                }}
                                                              >
                                                                {reorderContentsSubmoduleId === sub.id ? 'Exit Reorder' : 'Reorder'}
                                                              </Button>
                                                              <Button
                                                                variant="text"
                                                                size="small"
                                                                onClick={() => navigate('/content/add', { state: { courseId: course.id, moduleId: mod.id, submoduleId: sub.id } })}
                                                                sx={{
                                                                  fontSize: '0.75rem',
                                                                  py: 0,
                                                                  color: sub.brandColor || mod.brandColor || course.brandColor || '#6C1D5F',
                                                                  '&:hover': {
                                                                    backgroundColor: sub.brandColor ? `${sub.brandColor}10` : (mod.brandColor ? `${mod.brandColor}10` : 'rgba(108, 29, 95, 0.04)'),
                                                                  }
                                                                }}
                                                                startIcon={<AddIcon />}
                                                              >
                                                                Add Content
                                                              </Button>
                                                            </Box>
                                                          </Box>

                                                          {/* Contents render list */}
                                                          {subContents.length === 0 ? (
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ py: 1 }}>
                                                              No content uploaded yet.
                                                            </Typography>
                                                          ) : (
                                                            <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleContentDragEnd(e, sub.id)}>
                                                              <SortableContext items={subContents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                  {subContents.map((contentItem) => (
                                                                    <SortableItem key={contentItem.id} id={contentItem.id} handle={reorderContentsSubmoduleId !== sub.id}>
                                                                      {({ attributes: cAttr, listeners: cList }) => (
                                                                        <Box
                                                                          sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            p: 1,
                                                                            borderRadius: 1,
                                                                            backgroundColor: 'action.hover',
                                                                            borderLeft: `3px solid ${contentItem.brandColor || '#6C1D5F'}`,
                                                                          }}
                                                                        >
                                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                            {reorderContentsSubmoduleId === sub.id && (
                                                                              <Box {...cAttr} {...cList} sx={{ cursor: 'grab', display: 'flex' }}>
                                                                                <DragIndicatorIcon fontSize="small" color="action" />
                                                                              </Box>
                                                                            )}
                                                                            <FilePresentIcon fontSize="small" sx={{ color: contentItem.brandColor || sub.brandColor || '#6C1D5F' }} />
                                                                            <Typography variant="caption" fontWeight={600}>
                                                                              {contentItem.name}
                                                                            </Typography>
                                                                            <Chip label={contentItem.contentType} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                                                                            <Chip label={contentItem.level} size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: contentItem.brandColor || sub.brandColor || '#6C1D5F', color: '#FFF', fontWeight: 600 }} />
                                                                            <Chip label={`Slug: ${contentItem.slug}`} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                                                            <StatusBadge status={contentItem.status} />
                                                                          </Box>
                                                                          <Box>
                                                                            <Tooltip title="Preview Content">
                                                                              <IconButton size="small" onClick={() => navigate(`/content/preview/${contentItem.id}`)}>
                                                                                <VisibilityIcon fontSize="inherit" />
                                                                              </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Edit Content">
                                                                              <IconButton size="small" onClick={() => navigate(`/content/edit/${contentItem.id}`, { state: { courseId: course.id } })}>
                                                                                <EditIcon fontSize="inherit" />
                                                                              </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Delete Content">
                                                                              <IconButton size="small" color="error" onClick={() => triggerDelete('content', contentItem.id, sub.id)}>
                                                                                <DeleteIcon fontSize="inherit" />
                                                                              </IconButton>
                                                                            </Tooltip>
                                                                          </Box>
                                                                        </Box>
                                                                      )}
                                                                    </SortableItem>
                                                                  ))}
                                                                </Box>
                                                              </SortableContext>
                                                            </DndContext>
                                                          )}
                                                        </Box>
                                                      </Box>
                                                    )}
                                                  </SortableItem>
                                                );
                                              })}
                                            </Box>
                                          </SortableContext>
                                        </DndContext>
                                      )}
                                    </AccordionDetails>
                                  </Accordion>
                                )}
                              </SortableItem>
                            );
                          })}
                        </Box>
                      </SortableContext>
                    </DndContext>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Module Dialog Modal */}
      <ModuleDialog
        open={moduleModal.open}
        onClose={() => setModuleModal({ open: false, courseId: null, data: null })}
        onSave={handleSaveModule}
        moduleData={moduleModal.data}
        courseId={moduleModal.courseId}
        isSaving={moduleCreateMutation.isPending || moduleUpdateMutation.isPending}
      />

      {/* Submodule Dialog Modal */}
      <SubmoduleDialog
        open={submoduleModal.open}
        onClose={() => setSubmoduleModal({ open: false, moduleId: null, data: null })}
        onSave={handleSaveSubmodule}
        submoduleData={submoduleModal.data}
        moduleId={submoduleModal.moduleId}
        isSaving={submoduleCreateMutation.isPending || submoduleUpdateMutation.isPending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={`Delete ${deleteDialog.type?.toUpperCase()}?`}
        message={`Are you sure you want to delete this ${deleteDialog.type}? This will delete the structure and child attachments.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, type: '', id: '', parentId: '' })}
      />
    </Box>
  );
};

export default CourseList;
