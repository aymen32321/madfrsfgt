import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL logiciel : nécessaire pour la scène 3D sur une machine sans GPU.
Config.setChromiumOpenGlRenderer('swangle');
