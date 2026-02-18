import { withModuleFederation } from '@nx/module-federation/angular';
import mfConfig from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default async (config, context) => {
  const federatedConfigFn = await withModuleFederation(mfConfig, { dts: false });
  const appConfig = await federatedConfigFn(config, context);

  if (!appConfig.module) {
    appConfig.module = { rules: [] };
  }
  if (!appConfig.module.rules) {
    appConfig.module.rules = [];
  }

  appConfig.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: './apps/shell/postcss.config.js',
          },
        },
      },
    ],
  });

  return appConfig;
};
