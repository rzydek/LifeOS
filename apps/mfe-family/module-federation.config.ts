import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
    name: 'mfeFamily',
    exposes: {
        './Routes': 'apps/mfe-family/src/app/remote-entry/entry.routes.ts',
    },
    additionalShared: [
        [
            '@lifeos-nexus/data-access',
            {
                singleton: true,
                strictVersion: true,
                requiredVersion: '0.0.1',
                import: 'libs/shared/data-access/src/index.ts',
            },
        ],
        [
            '@lifeos-nexus/ui',
            {
                singleton: true,
                strictVersion: true,
                requiredVersion: '0.0.1',
                import: 'libs/ui/src/index.ts',
            },
        ],
    ],
    shared: (libraryName, defaultConfig) => {
        if (libraryName === '@lifeos-nexus/ui' || libraryName === '@lifeos-nexus/data-access') {
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
