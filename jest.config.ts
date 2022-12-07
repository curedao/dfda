import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  // testTimeout: 20000, Doesn't work here or in tests with jest.setTimeout(30000). Have to set in jest.preset.
};
