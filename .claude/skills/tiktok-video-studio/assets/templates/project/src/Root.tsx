import {Composition} from 'remotion';
import {STORY_FPS, STORY_FRAMES, Story} from './story/Story';

export const Root = () => (
  <>
    <Composition id="Story" component={Story} durationInFrames={STORY_FRAMES} fps={STORY_FPS} width={1080} height={1920} />
  </>
);
