import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { ForbiddenPage } from '@/app/pages/ForbiddenPage'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { GuestOnly, RequireAnyPermission, RequireAuth, RequirePermission, SessionGate } from '@/app/router/guards'
import { AccountPage } from '@/modules/account/pages/AccountPage'
import { AdminUsersPage } from '@/modules/admin/pages/AdminUsersPage'
import { RoleAssignmentPage } from '@/modules/admin/pages/RoleAssignmentPage'
import { RoleRequestsPage } from '@/modules/admin/pages/RoleRequestsPage'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { AdminEventDetailPage } from '@/modules/events/pages/admin/AdminEventDetailPage'
import { AdminEventListPage } from '@/modules/events/pages/admin/AdminEventListPage'
import { EventEditorPage } from '@/modules/events/pages/organizer/EventEditorPage'
import { OrganizerEventListPage } from '@/modules/events/pages/organizer/OrganizerEventListPage'
import { EventCatalogPage } from '@/modules/events/pages/public/EventCatalogPage'
import { EventDetailPage } from '@/modules/events/pages/public/EventDetailPage'

export const router = createBrowserRouter([
  {
    element: <SessionGate />,
    children: [
      {
        element: <StorefrontLayout />,
        children: [
          { index: true, element: <EventCatalogPage /> },
          { path: '/events', element: <EventCatalogPage /> },
          { path: '/events/:id', element: <EventDetailPage /> },
        ],
      },
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
              { path: '/forgot-password', element: <ForgotPasswordPage /> },
              { path: '/reset-password', element: <ResetPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/account', element: <AccountPage /> },
              {
                element: (
                  <RequireAnyPermission
                    codes={['CREATE_DRAFT_EVENT', 'UPDATE_OWN_EVENT', 'SUBMIT_EVENT', 'READ_UNPUBLISHED_EVENT']}
                  />
                ),
                children: [
                  { path: '/organizer/events', element: <OrganizerEventListPage /> },
                  { path: '/organizer/events/new', element: <EventEditorPage /> },
                  { path: '/organizer/events/:id', element: <EventEditorPage /> },
                ],
              },
              {
                element: <RequireAnyPermission codes={['REVIEW_EVENT', 'CANCEL_EVENT']} />,
                children: [
                  { path: '/admin/events', element: <AdminEventListPage /> },
                  { path: '/admin/events/:id', element: <AdminEventDetailPage /> },
                ],
              },
              {
                element: <RequirePermission code="REVIEW_ROLE_REQUEST" />,
                children: [{ path: '/admin/role-requests', element: <RoleRequestsPage /> }],
              },
              {
                element: <RequirePermission code="MANAGE_ROLES" />,
                children: [{ path: '/admin/roles', element: <RoleAssignmentPage /> }],
              },
              {
                element: <RequireAnyPermission codes={['READ_USERS', 'LOCK_ACCOUNT']} />,
                children: [{ path: '/admin/users', element: <AdminUsersPage /> }],
              },
              { path: '/forbidden', element: <ForbiddenPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
