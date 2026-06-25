import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import AdminLayout from '../layouts/AdminLayout';



// Admin Core Pages
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';

// Category CRUD Pages
import CategoryList from '../pages/Category/CategoryList';
import CategoryForm from '../pages/Category/CategoryForm';

// Course CRUD Pages
import CourseList from '../pages/Course/CourseList';
import CourseForm from '../pages/Course/CourseForm';
import CourseView from '../pages/Course/CourseView';



// Content CRUD Pages
import ContentList from '../pages/Content/ContentList';
import ContentForm from '../pages/Content/ContentForm';
import ContentPreview from '../pages/Content/ContentPreview';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirects to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Admin Console Pages */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Category Routes */}
        <Route path="/category" element={<CategoryList />} />
        <Route path="/category/add" element={<CategoryForm />} />
        <Route path="/category/edit/:id" element={<CategoryForm />} />

        {/* Course Routes */}
        <Route path="/course" element={<CourseList />} />
        <Route path="/course/add" element={<CourseForm />} />
        <Route path="/course/edit/:id" element={<CourseForm />} />
        <Route path="/course/view/:id" element={<CourseView />} />



        {/* Content Routes */}
        <Route path="/content" element={<ContentList />} />
        <Route path="/content/add" element={<ContentForm />} />
        <Route path="/content/edit/:id" element={<ContentForm />} />
        <Route path="/content/preview/:id" element={<ContentPreview />} />

        {/* Mock Management Views */}
        <Route path="/settings" element={<Settings />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
