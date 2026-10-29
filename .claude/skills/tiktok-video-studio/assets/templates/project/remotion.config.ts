import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL logiciel : nécessaire pour les scènes 3D (Three.js) sur une machine sans GPU.
Config.setChromiumOpenGlRenderer('swangle');
