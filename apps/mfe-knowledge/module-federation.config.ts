import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
    name: 'mfeKnowledge',
    exposes: {
        './Routes': 'apps/mfe-knowledge/src/app/remote-entry/entry.routes.ts',
    },
    shared: (libraryName, defaultConfig) => {
        if (libraryName === '@lifeos-nexus/ui') {
            return {
                singleton: true,
                strictVersion: true,
                requiredVersion: '0.0.1',
            };
        }
        return defaultConfig;
    },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
