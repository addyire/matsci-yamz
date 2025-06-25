import {
  RootRoute,
  Route,
  Router,
} from '@tanstack/router';
import React from 'react';
import App from './App';
import Terms from './pages/Terms';
import AddTerm from './pages/AddTerm';
import TermDefinitions from './pages/TermDefinitions';
import Definition from './pages/Definition';
import Tags from './pages/Tags';
import TagDefinitions from './pages/TagDefinitions';

const rootRoute = new RootRoute({
  component: App,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Terms,
});

const addRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'add',
  component: AddTerm,
});

const termRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'terms/$termId',
  component: TermDefinitions,
});

const definitionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'definition/$definitionId',
  component: Definition,
});

const tagsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'tags',
  component: Tags,
});

const tagRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'tags/$tagId',
  component: TagDefinitions,
});

export const router = new Router({
  routeTree: rootRoute.addChildren([
    indexRoute,
    addRoute,
    termRoute,
    definitionRoute,
    tagsRoute,
    tagRoute,
  ]),
});

export default router;
