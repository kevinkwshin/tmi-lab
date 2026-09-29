import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext, runInContext} from 'node:vm';
import test from 'node:test';

const source = readFileSync(process.env.WHEEL_SOURCE || new URL('../public/scroll.js', import.meta.url), 'utf8');
const state = source.slice(source.indexOf('let lastWheel'), source.indexOf('let touch;'));
const handler = source.slice(source.indexOf("addEventListener('wheel'"), source.indexOf("addEventListener('touchstart'"));
function wheel() {
  let now = 1000;
  let listener;
  const calls = [];
  const context = createContext({
    active:true, overlayOpen:() => false, current:5,
    slides:Array.from({length:30}, () => ({clientHeight:800})),
    performance:{now:() => now},
    addEventListener:(type, callback) => { listener = callback; },
    go:index => { context.current = index; calls.push(index); },
  });
  runInContext(state + handler, context);
  return {
    calls, context,
    send(deltaY, gap = 0, options = {}) {
      now += gap;
      let prevented = false;
      listener({deltaY, deltaX:0, deltaMode:0, preventDefault:() => { prevented = true; }, ...options});
      return prevented;
    },
  };
}
for (const amount of [12, 24, 120]) test(`isolated ${amount}px notches each advance immediately`, () => {
  const w = wheel();
  for (let i = 1; i <= 3; i++) {
    w.send(amount, 350);
    assert.equal(w.calls.length, i);
  }
});
test('equal 120ms wheel notches each advance once', () => {
  const w = wheel();
  for (let i = 1; i <= 3; i++) {
    w.send(120, 120);
    assert.equal(w.calls.length, i);
  }
});
test('soft deliberate reversal returns immediately', () => {
  const w = wheel();
  w.send(100);
  w.send(-12, 140);
  assert.deepEqual(w.calls, [6, 5]);
});
test('continuous momentum including sparse tail advances once', () => {
  const w = wheel();
  for (const delta of [100, 85, 70]) w.send(delta, 25);
  w.send(42, 250);
  w.send(35, 260);
  assert.deepEqual(w.calls, [6]);
  w.send(100, 750);
  assert.deepEqual(w.calls, [6, 7]);
});
test('gentle renewed gesture escapes a consumed tail', () => {
  const w = wheel();
  for (const delta of [80, 40, 16, 4]) w.send(delta, 25);
  w.send(12, 140);
  assert.deepEqual(w.calls, [6, 7]);
});
test('small rapid trackpad input accumulates and consumes only one slide', () => {
  const w = wheel();
  for (let i = 0; i < 30; i++) w.send(2, 15);
  assert.deepEqual(w.calls, [6]);
});
test('isolated subpixel noise does not advance', () => {
  const w = wheel();
  for (let i = 0; i < 5; i++) w.send(.5, 350);
  assert.deepEqual(w.calls, []);
});
test('line and page wheel units normalize', () => {
  for (const deltaMode of [1, 2]) {
    const w = wheel();
    w.send(1, 0, {deltaMode});
    assert.deepEqual(w.calls, [6]);
  }
});
test('pinch, horizontal, overlay, and reading input retain browser behavior', () => {
  const w = wheel();
  for (const options of [{ctrlKey:true}, {metaKey:true}, {deltaX:200}, {deltaY:0}]) assert.equal(w.send(120, 0, options), false);
  w.context.overlayOpen = () => true;
  assert.equal(w.send(120), false);
  w.context.overlayOpen = () => false;
  w.context.active = false;
  assert.equal(w.send(120), false);
  assert.deepEqual(w.calls, []);
});
