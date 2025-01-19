import { JestConfigWithTsJest } from 'ts-jest'

const esModules = ['@react-leaflet', 'react-leaflet'].join('|');

export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules}).+\\.js$`,
  ],
} satisfies JestConfigWithTsJest;
