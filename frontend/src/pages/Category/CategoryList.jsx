import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { useCategories } from '../../hooks/useCategories';
import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useSubmodules } from '../../hooks/useSubmodules';
import { useContents } from '../../hooks/useContents';
import FileUpload from '../../components/FileUpload';
import { useUI } from '../../context/UIContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getIconComponent } from '../../utils/iconHelper';

const CategoryList = () => {
  const navigate = useNavigate();
  const { useList, useDelete } = useCategories();
  const { data: categories = [], isLoading: isCategoriesLoading } = useList();
  const { data: courses = [], isLoading: isCoursesLoading } = useCourses().useList();
  const { data: modules = [], isLoading: isModulesLoading } = useModules().useList();
  const { data: submodules = [], isLoading: isSubmodulesLoading } = useSubmodules().useList();
  const createContentMutation = useContents().useCreate();
  const deleteMutation = useDelete();
  const { showToast } = useUI();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Deletion modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Content upload modal state
  const [uploadCategory, setUploadCategory] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState('');

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    // Validation: Cannot delete category with courses
    const hasCourses = courses.some((course) => course.categoryId === deleteId);
    if (hasCourses) {
      showToast('Cannot delete category: Please delete or reassign all courses in this category first.', 'error');
      setDeleteId(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteId);
    } catch (e) {
      // Toast handles error automatically via React Query hook
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filtering
  const filteredCategories = categories.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (row.description && row.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (row.slug && row.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = isCategoriesLoading || isCoursesLoading || isModulesLoading || isSubmodulesLoading;

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
          <FolderIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure LMS groupings and expand to view assigned courses.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => navigate('/category/add')}
        >
          Add Category
        </Button>
      </Box>

      {/* Filters Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 320, width: '100%', backgroundColor: 'background.paper' }}
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

      {/* Expandable Category Tree Stack */}
      {filteredCategories.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
          <Typography color="text.secondary" variant="body1">
            No categories found matching filter criteria.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCategories.map((cat) => {
            const catCourses = courses.filter((c) => c.categoryId === cat.id);
            const defaultFolderImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80';

            return (
              <Accordion
                key={cat.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  borderLeft: `6px solid ${cat.brandColor || '#6C1D5F'}`,
                }}
              >
                {/* Accordion Summary Header */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container spacing={2} alignItems="center" sx={{ pr: 2 }}>
                    <Grid item xs={12} sm={1.5} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          backgroundColor: cat.brandColor || '#1A73E8',
                          color: '#FFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: 'none',
                        }}
                      >
                        {getIconComponent(cat.icon || 'Folder', { sx: { fontSize: 24 } })}
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={9} md={9}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ fontFamily: '"Outfit", sans-serif' }}>
                          {cat.name}
                        </Typography>
                        <Chip label="ACTIVE" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(46, 125, 50, 0.08)', border: '1px solid rgba(46, 125, 50, 0.3)', color: '#2e7d32' }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip label={cat.level} size="small" sx={{ height: 20, fontSize: '0.7rem', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
                        <Chip label={cat.language} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={cat.estimatedDuration} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={`URL: ${cat.slug}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cat.brandColor || '#1A73E8', border: '1px solid', borderColor: 'divider', ml: 0.5 }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={1.5} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Upload Content to Submodules">
                        <IconButton size="small" onClick={() => {
                          setUploadCategory(cat);
                          setSelectedCourseId('');
                          setSelectedModuleId('');
                          setSelectedSubmoduleId('');
                        }}>
                          <UploadFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Category Details">
                        <IconButton size="small" onClick={() => navigate(`/category/edit/${cat.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Category">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(cat.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </AccordionSummary>

                {/* Accordion Details (Assigned Courses) */}
                <AccordionDetails sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover' }}>
                  {/* Category Details Header Card */}
                  <Card sx={{ mb: 4, p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Grid container spacing={3}>
                      {/* Left: Banner/Thumbnail Image */}
                      <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Box
                          component="img"
                          src={cat.bannerImage || defaultFolderImage}
                          alt={cat.name}
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
                          {cat.description || 'No description supplied for this category yet.'}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Integrated URL Slug
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {cat.slug || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Level
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {cat.level || 'Beginner'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Estimated Duration
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {cat.estimatedDuration || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Icon
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {cat.icon || 'Folder'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Language
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                {cat.language || 'English'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                                Brand Color
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.brandColor || '#6C1D5F', border: '1px solid', borderColor: 'divider' }} />
                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                  {cat.brandColor || '#6C1D5F'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>

                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: cat.brandColor || '#6C1D5F' }} /> Courses Assigned to Category ({catCourses.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {catCourses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No courses assigned to this category yet.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {catCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                          <Card 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2, 
                              p: 1.5, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.selected',
                              }
                            }}
                            onClick={() => navigate(`/course/view/${course.id}`)}
                          >
                            <Avatar
                              variant="rounded"
                              src={course.thumbnail}
                              sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider' }}
                            />
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {course.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Level: {course.level} • {course.estimatedDuration}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Category?"
        message="Are you sure you want to delete this category? All courses in it must be cleared or reassigned first."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />

      {/* Upload Content Dialog */}
      <Dialog
        open={uploadCategory !== null}
        onClose={() => setUploadCategory(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.5rem', pb: 1 }}>
          Upload Content to {uploadCategory?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Outfit", sans-serif', mb: 0.5 }}>
              Drop files into this category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a course, module, and submodule in this category, then drop PDF, PPT, MP4, DOCX, or image files.
            </Typography>
          </Box>

          {/* Selector Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Course"
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedModuleId('');
                  setSelectedSubmoduleId('');
                }}
                size="small"
              >
                {courses.filter((c) => c.categoryId === uploadCategory?.id).length === 0 ? (
                  <MenuItem disabled value="">
                    No courses available in this category
                  </MenuItem>
                ) : (
                  courses
                    .filter((c) => c.categoryId === uploadCategory?.id)
                    .map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Module"
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedSubmoduleId('');
                }}
                disabled={!selectedCourseId}
                size="small"
              >
                {!selectedCourseId ? (
                  <MenuItem disabled value="">
                    Select Course first
                  </MenuItem>
                ) : modules.filter((m) => m.courseId === selectedCourseId).length === 0 ? (
                  <MenuItem disabled value="">
                    No modules available in this course
                  </MenuItem>
                ) : (
                  modules
                    .filter((m) => m.courseId === selectedCourseId)
                    .map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Submodule"
                value={selectedSubmoduleId}
                onChange={(e) => setSelectedSubmoduleId(e.target.value)}
                disabled={!selectedModuleId}
                size="small"
              >
                {!selectedModuleId ? (
                  <MenuItem disabled value="">
                    Select Module first
                  </MenuItem>
                ) : submodules.filter((s) => s.moduleId === selectedModuleId).length === 0 ? (
                  <MenuItem disabled value="">
                    No submodules available in this module
                  </MenuItem>
                ) : (
                  submodules
                    .filter((s) => s.moduleId === selectedModuleId)
                    .map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))
                )}
              </TextField>
            </Grid>
          </Grid>

          {/* File Upload Zone */}
          <Box sx={{ position: 'relative' }}>
            {!selectedSubmoduleId ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Please select Course, Module, and Submodule above to enable file uploads.
                </Typography>
              </Box>
            ) : (
              <FileUpload
                multiple={false}
                onUploadComplete={async (file) => {
                  if (!file) return;
                  
                  // Auto detect content type based on extension
                  const ext = file.fileName.split('.').pop().toLowerCase();
                  let detectedContentType = 'Notes';
                  if (ext === 'pdf') {
                    detectedContentType = 'PDF';
                  } else if (ext === 'ppt' || ext === 'pptx') {
                    detectedContentType = 'PPT';
                  } else if (ext === 'mp4') {
                    detectedContentType = 'Video';
                  }
                  
                  // Auto generate slug
                  const baseName = file.fileName.replace(/\.[^/.]+$/, "");
                  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  
                  // Brand color defaults to category brand color
                  const brandColor = uploadCategory?.brandColor || '#6C1D5F';
                  
                  // Prepare data for backend API
                  const payload = {
                    name: baseName,
                    contentType: detectedContentType,
                    courseId: selectedCourseId,
                    moduleId: selectedModuleId,
                    submoduleId: selectedSubmoduleId,
                    description: `Uploaded file: ${file.fileName}`,
                    status: 'Active',
                    slug: slug,
                    level: 'Beginner',
                    language: 'English',
                    estimatedDuration: '10 mins',
                    brandColor: brandColor,
                    bannerImage: '',
                    icon: '',
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    fileUrl: file.fileUrl
                  };

                  try {
                    await createContentMutation.mutateAsync(payload);
                  } catch (err) {
                    // Handled automatically by toast in hook
                  }
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setUploadCategory(null)}
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
