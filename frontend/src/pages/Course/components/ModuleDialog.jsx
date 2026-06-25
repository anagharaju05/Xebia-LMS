import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

const schema = yup.object().shape({
  name: yup.string().min(3, 'Module Name must be at least 3 characters.').required('Module Name is required.'),
  description: yup.string().max(400, 'Description cannot exceed 400 characters.').optional(),
  slug: yup.string().required('Slug is required.'),
  level: yup.string().oneOf(['Beginner', 'Intermediate', 'Advanced']).required('Level is required.'),
  language: yup.string().required('Language is required.'),
  estimatedDuration: yup.string().required('Estimated duration is required.'),
  brandColor: yup.string().optional(),
  bannerImage: yup.string().optional(),
  icon: yup.string().optional(),
});

const ModuleDialog = ({ open, onClose, onSave, moduleData, courseId, isSaving }) => {
  const isEditMode = !!moduleData;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      level: 'Beginner',
      language: 'English',
      estimatedDuration: '',
      brandColor: '#6C1D5F',
      bannerImage: '',
      icon: '',
    },
  });

  const brandColorValue = watch('brandColor') || '#6C1D5F';

  useEffect(() => {
    if (open) {
      if (isEditMode && moduleData) {
        reset({
          name: moduleData.name || '',
          description: moduleData.description || '',
          slug: moduleData.slug || '',
          level: moduleData.level || 'Beginner',
          language: moduleData.language || 'English',
          estimatedDuration: moduleData.estimatedDuration || '',
          brandColor: moduleData.brandColor || '#6C1D5F',
          bannerImage: moduleData.bannerImage || '',
          icon: moduleData.icon || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          slug: '',
          level: 'Beginner',
          language: 'English',
          estimatedDuration: '',
          brandColor: '#6C1D5F',
          bannerImage: '',
          icon: '',
        });
      }
    }
  }, [open, isEditMode, moduleData, reset]);

  const onSubmit = (data) => {
    onSave({
      ...data,
      courseId,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle fontWeight={700}>
          {isEditMode ? 'Edit Module' : 'Add Module'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                {...register('name')}
                label="Module Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('slug')}
                label="Slug URL"
                fullWidth
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('description')}
                label="Description"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                {...register('level')}
                label="Level"
                fullWidth
                defaultValue="Beginner"
                error={!!errors.level}
                helperText={errors.level?.message}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('language')}
                label="Language"
                fullWidth
                error={!!errors.language}
                helperText={errors.language?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('estimatedDuration')}
                label="Estimated Duration"
                placeholder="e.g. 5 hours"
                fullWidth
                error={!!errors.estimatedDuration}
                helperText={errors.estimatedDuration?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  {...register('brandColor')}
                  label="Brand Color"
                  fullWidth
                  error={!!errors.brandColor}
                  helperText={errors.brandColor?.message}
                />
                <input
                  type="color"
                  value={brandColorValue}
                  onChange={(e) => setValue('brandColor', e.target.value)}
                  style={{ width: 40, height: 40, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('icon')}
                label="Icon"
                fullWidth
                error={!!errors.icon}
                helperText={errors.icon?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('bannerImage')}
                label="Banner Image URL"
                fullWidth
                error={!!errors.bannerImage}
                helperText={errors.bannerImage?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSaving} sx={{ minWidth: 100 }}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModuleDialog;
