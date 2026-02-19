import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
    name: 'shell',
    /**
     * To use a remote that does not exist in your current Nx Workspace
     * You can use the tuple-syntax to define your remote
     *
     * remotes: [['my-external-remote', 'https://nx-angular-remote.netlify.app']]
     *
     * You _may_ need to add a `remotes.d.ts` file to your `src/` folder declaring the external remote for tsc, with the
     * following content:
     *
     * declare module 'my-external-remote';
     *
     */
    remotes: ['mfeGarage', 'mfeFamily', 'mfeKnowledge'],
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
