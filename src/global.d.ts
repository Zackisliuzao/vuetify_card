declare global {
  import { Viewer } from 'cesium';

  declare const viewer: Viewer;

  declare const Cesium: typeof import('cesium'); 
}
export {};