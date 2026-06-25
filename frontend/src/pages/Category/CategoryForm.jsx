import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Material UI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';

import { useCategories } from '../../hooks/useCategories';

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().min(3, 'Name must be at least 3 characters.').required('Category Name is required.'),
  description: yup.string().max(300, 'Description cannot exceed 300 characters.').optional(),
  status: yup.string().oneOf(['Active', 'Inactive']).required('Status is required.'),
  slug: yup.string().required('Slug is required.'),
  level: yup.string().oneOf(['Beginner', 'Intermediate', 'Advanced']).required('Level is required.'),
  language: yup.string().required('Language is required.'),
  estimatedDuration: yup.string().required('Estimated duration is required.'),
  brandColor: yup.string().optional(),
  bannerImage: yup.string().optional(),
  icon: yup.string().optional(),
});

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useDetail, useCreate, useUpdate } = useCategories();
  const createMutation = useCreate();
  const updateMutation = useUpdate(id);

  // Fetch detail if edit mode
  const { data: category, isLoading: isDetailLoading } = useDetail(id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Active',
      slug: '',
      level: 'Beginner',
      language: 'English',
      estimatedDuration: '',
      brandColor: '#6C1D5F',
      bannerImage: '',
      icon: '',
    },
  });

  // Populate form values when data is loaded (in Edit Mode)
  useEffect(() => {
    if (isEditMode && category) {
      reset({
        name: category.name,
        description: category.description,
        status: category.status,
        slug: category.slug || '',
        level: category.level || 'Beginner',
        language: category.language || 'English',
        estimatedDuration: category.estimatedDuration || '',
        brandColor: category.brandColor || '#6C1D5F',
        bannerImage: category.bannerImage || '',
        icon: category.icon || '',
      });
    }
  }, [category, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/category');
    } catch (e) {
      // Errors handled by React Query onError toast triggers
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isDetailLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>
      {/* Upper action row */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/category')}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <FolderIcon color="primary" sx={{ fontSize: 30 }} />
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? 'Edit Category' : 'Create Category'}
        </Typography>
      </Box>

      {/* Form Card Layout */}
      <Card sx={{ maxWidth: 680 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Category Details & Metadata
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            Define the identity, organization settings, hierarchy parameters, and colors for this category.
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  {...register('name')}
                  label="Category Name"
                  placeholder="e.g. Frontend Development"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('slug')}
                  label="Slug URL"
                  placeholder="e.g. frontend-development"
                  fullWidth
                  error={!!errors.slug}
                  helperText={errors.slug?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('description')}
                  label="Description"
                  placeholder="Brief summary of topics covered under this category..."
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  {...register('level')}
                  label="Level"
                  fullWidth
                  error={!!errors.level}
                  helperText={errors.level?.message}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('language')}
                  label="Language"
                  placeholder="e.g. English, Dutch"
                  fullWidth
                  error={!!errors.language}
                  helperText={errors.language?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('estimatedDuration')}
                  label="Estimated Duration"
                  placeholder="e.g. 40 hours"
                  fullWidth
                  error={!!errors.estimatedDuration}
                  helperText={errors.estimatedDuration?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    {...register('brandColor')}
                    label="Brand Color (Hex)"
                    placeholder="e.g. #6C1D5F"
                    fullWidth
                    error={!!errors.brandColor}
                    helperText={errors.brandColor?.message}
                  />
                  <Box sx={{ mt: 1 }}>
                    <input
                      type="color"
                      {...register('brandColor')}
                      style={{ width: 44, height: 44, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  {...register('bannerImage')}
                  label="Banner Image URL"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  fullWidth
                  error={!!errors.bannerImage}
                  helperText={errors.bannerImage?.message}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('icon')}
                  label="Icon Tag"
                  placeholder="e.g. Folder, Code"
                  fullWidth
                  error={!!errors.icon}
                  helperText={errors.icon?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  {...register('status')}
                  label="Status"
                  fullWidth
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/category')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSaving}
                sx={{ minWidth: 120 }}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Details'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoryForm;
