import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Material UI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ReorderIcon from '@mui/icons-material/Reorder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';

// DnD Kit
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Hooks & Components
import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useSubmodules } from '../../hooks/useSubmodules';
import { useContents } from '../../hooks/useContents';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import SortableItem from '../../components/SortableItem';
import FileUpload from '../../components/FileUpload';

// Dialogs
import ModuleDialog from './components/ModuleDialog';
import SubmoduleDialog from './components/SubmoduleDialog';
import { getIconComponent } from '../../utils/iconHelper';

const CourseView = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Reorder mode toggles
  const [reorderModulesMode, setReorderModulesMode] = useState(false);
  const [reorderSubmodulesModuleId, setReorderSubmodulesModuleId] = useState(null);
  const [reorderContentsSubmoduleId, setReorderContentsSubmoduleId] = useState(null);

  // File Upload modal / zone mapping
  const [uploadZoneSubmoduleId, setUploadZoneSubmoduleId] = useState(null);

  // CRUD confirmation states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', parentId: '' });

  // Modal forms states
  const [moduleModal, setModuleModal] = useState({ open: false, courseId: null, data: null });
  const [submoduleModal, setSubmoduleModal] = useState({ open: false, moduleId: null, data: null });

  // Hook queries
  const { useDetail: useCourseDetail } = useCourses();
  const { useListByCourse, useReorder: useModuleReorder, useDelete: useModuleDelete, useCreate: useModuleCreate, useUpdate: useModuleUpdate } = useModules();
  const { useList: useSubmodulesList, useReorder: useSubmoduleReorder, useDelete: useSubmoduleDelete, useCreate: useSubmoduleCreate, useUpdate: useSubmoduleUpdate } = useSubmodules();
  const { useList: useContentsList, useReorder: useContentReorder, useDelete: useContentDelete, useCreate: useContentCreate } = useContents();

  const { data: course, isLoading: isCourseLoading } = useCourseDetail(courseId);
  const { data: modules = [], isLoading: isModulesLoading } = useListByCourse(courseId);
  const { data: submodules = [], isLoading: isSubmodulesLoading } = useSubmodulesList();
  const { data: contents = [], isLoading: isContentsLoading } = useContentsList();

  const moduleReorderMutation = useModuleReorder();
  const submoduleReorderMutation = useSubmoduleReorder();
  const contentReorderMutation = useContentReorder();

  const moduleDeleteMutation = useModuleDelete();
  const submoduleDeleteMutation = useSubmoduleDelete();
  const contentDeleteMutation = useContentDelete();
  const contentCreateMutation = useContentCreate();

  const moduleCreateMutation = useModuleCreate();
  const moduleUpdateMutation = useModuleUpdate();
  const submoduleCreateMutation = useSubmoduleCreate();
  const submoduleUpdateMutation = useSubmoduleUpdate();

  const isLoading = isCourseLoading || isModulesLoading || isSubmodulesLoading || isContentsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Course not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/course')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  // --- Deletion Handlers ---
  const triggerDelete = (type, id, parentId = '') => {
    setDeleteDialog({ open: true, type, id, parentId });
  };

  const handleConfirmDelete = async () => {
    const { type, id, parentId } = deleteDialog;
    try {
      if (type === 'module') {
        await moduleDeleteMutation.mutateAsync({ id, courseId });
      } else if (type === 'submodule') {
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
  const handleModuleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    const reordered = arrayMove(modules, oldIndex, newIndex);
    const orderedIds = reordered.map((m) => m.id);

    // Optimistically update query client state
    queryClient.setQueryData(['modules', 'course', courseId], reordered);

    try {
      await moduleReorderMutation.mutateAsync({ orderedIds, courseId });
    } catch (e) {
      // Revert cache on error
      queryClient.invalidateQueries({ queryKey: ['modules', 'course', courseId] });
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

  // --- Upload Files Callback ---
  const handleUploadComplete = async (fileDetails, submodule) => {
    if (!fileDetails) return;
    try {
      await contentCreateMutation.mutateAsync({
        courseId,
        moduleId: submodule.moduleId,
        submoduleId: submodule.id,
        name: fileDetails.fileName.split('.').slice(0, -1).join('.'),
        contentType: fileDetails.fileName.endsWith('.mp4') ? 'Video' : 'PDF',
        fileName: fileDetails.fileName,
        fileSize: fileDetails.fileSize,
        fileUrl: fileDetails.fileUrl,
        status: 'Active',
      });
      setUploadZoneSubmoduleId(null);
    } catch (e) {
      // Handled by react query
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

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/course')}>
          Back to Courses
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Course Workspace
        </Typography>
      </Box>

      {/* Course Metadata Card */}
      <Card sx={{ mb: 4, borderLeft: `6px solid ${course.brandColor || '#6C1D5F'}` }}>
        {course.bannerImage && (
          <Box
            component="img"
            src={course.bannerImage}
            alt="Course Banner"
            sx={{ width: '100%', height: 180, objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  backgroundColor: course.brandColor || '#1A73E8',
                  color: '#FFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: 'none',
                }}
              >
                {getIconComponent(course.icon, { sx: { fontSize: 44 } })}
              </Avatar>
              {course.thumbnail && (
                <Box
                  component="img"
                  src={course.thumbnail}
                  alt={course.name}
                  sx={{
                    width: '100%',
                    height: 110,
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={9} md={9.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={700}>
                  {course.name}
                </Typography>
                <Chip label={course.categoryName} size="small" variant="filled" sx={{ backgroundColor: course.brandColor || '#6C1D5F', color: '#FFF', fontWeight: 600 }} />
                <StatusBadge status={course.status} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Slug: ${course.slug}`} size="small" variant="outlined" />
                <Chip label={`Level: ${course.level}`} size="small" variant="outlined" sx={{ color: course.brandColor || '#6C1D5F', borderColor: course.brandColor || '#6C1D5F' }} />
                <Chip label={`Lang: ${course.language}`} size="small" variant="outlined" />
                <Chip label={`Duration: ${course.estimatedDuration}`} size="small" variant="outlined" />
                {course.icon && <Chip label={`Icon: ${course.icon}`} size="small" variant="outlined" />}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">Theme:</Typography>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: course.brandColor || '#6C1D5F', border: '1px solid #ccc' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 800 }}>
                {course.description || 'No description supplied for this course yet.'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                size="small"
                onClick={() => navigate(`/course/edit/${course.id}`)}
                sx={{
                  color: course.brandColor || '#6C1D5F',
                  borderColor: course.brandColor || '#6C1D5F',
                  '&:hover': {
                    borderColor: course.brandColor || '#6C1D5F',
                    backgroundColor: course.brandColor ? `${course.brandColor}10` : 'rgba(108, 29, 95, 0.04)',
                  }
                }}
              >
                Edit Details
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Syllabus Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          TabIndicatorProps={{
            style: { backgroundColor: course.brandColor || '#6C1D5F' }
          }}
          sx={{
            '& .MuiTab-root.Mui-selected': {
              color: course.brandColor || '#6C1D5F',
            }
          }}
        >
          <Tab label="Curriculum Builder" icon={<LibraryBooksIcon />} iconPosition="start" />
          <Tab label="Information" />
        </Tabs>
      </Box>

      {/* Tab: Information */}
      {activeTab === 1 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Course Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">Description: {course.description}</Typography>
        </Card>
      )}

      {/* Tab: Curriculum Builder */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>
              Syllabus Structure
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant={reorderModulesMode ? 'contained' : 'outlined'}
                startIcon={<ReorderIcon />}
                onClick={() => setReorderModulesMode(!reorderModulesMode)}
                size="small"
              >
                {reorderModulesMode ? 'Exit Module Reorder' : 'Reorder Modules'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModuleModal({ open: true, courseId: course.id, data: null })}
                size="small"
              >
                Add Module
              </Button>
            </Box>
          </Box>

          {/* Module List Stack */}
          {modules.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
              <Typography color="text.secondary" variant="body1" gutterBottom>
                No modules created yet. Get started by adding a module to this course.
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setModuleModal({ open: true, courseId: course.id, data: null })}
                sx={{ mt: 2 }}
              >
                Add Module
              </Button>
            </Card>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
              <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {modules.map((mod) => (
                    <SortableItem key={mod.id} id={mod.id} handle={!reorderModulesMode}>
                      {({ attributes, listeners }) => (
                        <Accordion
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            '&:before': { display: 'none' },
                            borderLeft: `4px solid ${mod.brandColor || '#6C1D5F'}`,
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(108, 29, 95, 0.01)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, pr: 2 }}>
                              {reorderModulesMode && (
                                <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                  <DragIndicatorIcon color="action" />
                                </Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>
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

                              {/* Module action triggers */}
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
                            {/* Inner Submodules List */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SubtitlesIcon fontSize="small" sx={{ color: mod.brandColor || course.brandColor || '#6C1D5F' }} /> Submodules
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="text"
                                  size="small"
                                  startIcon={<ReorderIcon />}
                                  onClick={() =>
                                    setReorderSubmodulesModuleId(
                                      reorderSubmodulesModuleId === mod.id ? null : mod.id
                                    )
                                  }
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

                            {/* Submodule render list */}
                            {submodules.filter((s) => s.moduleId === mod.id).length === 0 ? (
                              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                No submodules added to this module yet.
                              </Typography>
                            ) : (
                              <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleSubmoduleDragEnd(e, mod.id)}
                              >
                                <SortableContext
                                  items={submodules.filter((s) => s.moduleId === mod.id).map((s) => s.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {submodules
                                      .filter((s) => s.moduleId === mod.id)
                                      .map((sub) => (
                                        <SortableItem
                                          key={sub.id}
                                          id={sub.id}
                                          handle={reorderSubmodulesModuleId !== mod.id}
                                        >
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
                                                    <IconButton
                                                      size="small"
                                                      color="error"
                                                      onClick={() => triggerDelete('submodule', sub.id, mod.id)}
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Box>
                                              </Box>

                                              {/* Content list mapping */}
                                              <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Learning Materials
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                      variant="text"
                                                      size="small"
                                                      onClick={() =>
                                                        setReorderContentsSubmoduleId(
                                                          reorderContentsSubmoduleId === sub.id ? null : sub.id
                                                        )
                                                      }
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
                                                      onClick={() =>
                                                        setUploadZoneSubmoduleId(
                                                          uploadZoneSubmoduleId === sub.id ? null : sub.id
                                                        )
                                                      }
                                                      sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0,
                                                        color: sub.brandColor || mod.brandColor || course.brandColor || '#6C1D5F',
                                                        '&:hover': {
                                                          backgroundColor: sub.brandColor ? `${sub.brandColor}10` : (mod.brandColor ? `${mod.brandColor}10` : 'rgba(108, 29, 95, 0.04)'),
                                                        }
                                                      }}
                                                      startIcon={<UploadFileIcon />}
                                                    >
                                                      Upload
                                                    </Button>
                                                    <Button
                                                      variant="text"
                                                      size="small"
                                                      onClick={() => navigate('/content/add', { state: { courseId, moduleId: mod.id, submoduleId: sub.id } })}
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
                                                      Form
                                                    </Button>
                                                  </Box>
                                                </Box>

                                                {/* Drag & drop upload zone */}
                                                {uploadZoneSubmoduleId === sub.id && (
                                                  <Box sx={{ my: 1.5, p: 1, border: '1px dashed #FF6200', borderRadius: 1.5 }}>
                                                    <FileUpload onUploadComplete={(file) => handleUploadComplete(file, sub)} />
                                                  </Box>
                                                )}

                                                {contents.filter((c) => c.submoduleId === sub.id).length === 0 ? (
                                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ py: 1 }}>
                                                    No content uploaded yet.
                                                  </Typography>
                                                ) : (
                                                  <DndContext
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={(e) => handleContentDragEnd(e, sub.id)}
                                                  >
                                                    <SortableContext
                                                      items={contents.filter((c) => c.submoduleId === sub.id).map((c) => c.id)}
                                                      strategy={verticalListSortingStrategy}
                                                    >
                                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {contents
                                                          .filter((c) => c.submoduleId === sub.id)
                                                          .map((contentItem) => (
                                                            <SortableItem
                                                              key={contentItem.id}
                                                              id={contentItem.id}
                                                              handle={reorderContentsSubmoduleId !== sub.id}
                                                            >
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
                                                                    <Chip
                                                                      label={contentItem.contentType}
                                                                      size="small"
                                                                      sx={{ height: 18, fontSize: '0.65rem' }}
                                                                    />
                                                                    <Chip label={contentItem.level} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: contentItem.brandColor || sub.brandColor || '#6C1D5F', color: '#FFF', fontWeight: 600 }} />
                                                                    <Chip label={`Slug: ${contentItem.slug}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                                                                    <StatusBadge status={contentItem.status} />
                                                                  </Box>
                                                                  <Box>
                                                                    <Tooltip title="Preview Content">
                                                                      <IconButton size="small" onClick={() => navigate(`/content/preview/${contentItem.id}`)}>
                                                                        <VisibilityIcon fontSize="inherit" />
                                                                      </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Edit Content">
                                                                      <IconButton size="small" onClick={() => navigate(`/content/edit/${contentItem.id}`, { state: { courseId } })}>
                                                                        <EditIcon fontSize="inherit" />
                                                                      </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Content">
                                                                      <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => triggerDelete('content', contentItem.id, sub.id)}
                                                                      >
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
                                      ))}
                                  </Box>
                                </SortableContext>
                              </DndContext>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </SortableItem>
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          )}
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

export default CourseView;
