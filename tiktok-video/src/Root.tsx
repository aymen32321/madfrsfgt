import {Composition} from 'remotion';
import {CeQueCaTeCoute, TOTAL_FRAMES} from './CeQueCaTeCoute';

export const Root = () => (
  <Composition
    id="CeQueCaTeCoute"
    component={CeQueCaTeCoute}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
