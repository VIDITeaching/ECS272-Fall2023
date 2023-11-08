import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Dashboards

const Pokemon = Loader(lazy(() => import('src/content/dashboards/Pokemon')));
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Pokemon />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

export default routes;
