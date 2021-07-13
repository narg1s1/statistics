import { DBConfig } from 'ngx-indexed-db';

export enum DatabaseEntity {
  ShopTheme = 'shop-theme',
  ShopThemeVersion = 'shop-theme-version',
  ShopThemeSource = 'shop-theme-source',
  ShopThemeSnapshot = 'shop-theme-snapshot',
  RawTheme = 'raw-theme',
}

export const MockEditorDatabaseConfig: DBConfig = {
  name: 'Sandbox Editor',
  version: 1,
  objectStoresMeta: [
    {
      store: DatabaseEntity.ShopTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
      ],
    },
    {
      store: DatabaseEntity.ShopThemeVersion,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.ShopThemeSource,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
      ],
    },
    {
      store: DatabaseEntity.ShopThemeSnapshot,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.RawTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
  ],
};
