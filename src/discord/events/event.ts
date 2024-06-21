import interactionCreate from './interactionCreate.js';
import ready from './ready.js';

const events: MyEvent[] = [
  interactionCreate,
  ready,
]

export default events;

export interface MyEvent {
  name: string;
  once?: boolean;
  execute: (...args: any) => Promise<void> | void;
}
