import {Composition} from 'remotion';
import {CeQueCaTeCoute, TOTAL_FRAMES} from './CeQueCaTeCoute';
import {DUEL_FRAMES, LeDuel} from './duel/LeDuel';

export const Root = () => (
  <>
    <Composition
      id="CeQueCaTeCoute"
      component={CeQueCaTeCoute}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="LeDuel" component={LeDuel} durationInFrames={DUEL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
