import {Composition} from 'remotion';
import {CeQueCaTeCoute, TOTAL_FRAMES} from './CeQueCaTeCoute';
import {DUEL_FRAMES, LeDuel} from './duel/LeDuel';
import {FPS, RAPPEL_FRAMES, Rappel} from './rappel/Rappel';
import {KIT_FPS, KIT_FRAMES, Kit} from './kit/Kit';

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
    <Composition id="Rappel" component={Rappel} durationInFrames={RAPPEL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="KitUrgence" component={Kit} durationInFrames={KIT_FRAMES} fps={KIT_FPS} width={1080} height={1920} />
  </>
);
