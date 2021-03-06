const ease = require('./easing.js').ease;
const resolution = 25;

class Anim {
  constructor() {
    this.fxStack = [];
    this.interval = null;
  }

  add(to, duration = resolution, options = {}) {
    options.easing = options.easing || 'linear';

    this.fxStack.push({ 'to': to, 'duration': duration, 'options': options });
    return this;
  }

  delay(duration) {
    this.add({}, duration);
    return this;
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.fxStack = [];
  }

  run(universe, onFinish) {
    let config = {};
    let ticks = 0;
    let duration = 0;
    let animationStep;
    let iid = null;

    const stack = [ ...this.fxStack ];

    const aniSetup = () => {
      animationStep = stack.shift();
      ticks = 0;
      duration = animationStep.duration;

      config = {};
      for (const k in animationStep.to) {
        config[k] = {
          'start': universe.get(k),
          'end': animationStep.to[k],
          'options': animationStep.options,
        };
      }
    };
    const aniStep = () => {
      const newValues = {};

      for (const k in config) {
        const entry = config[k];
        const easing = ease[entry.options.easing];

        newValues[k] = Math.round(entry.start + easing(ticks, 0, 1, duration) * (entry.end - entry.start));
      }

      ticks = ticks + resolution;
      universe.update(newValues);
      if (ticks > duration) {
        if (stack.length > 0) {
          aniSetup();
        } else {
          clearInterval(iid);
          if (onFinish) {
            onFinish();
          }
        }
      }
    };

    aniSetup();
    iid = this.interval = setInterval(aniStep, resolution);

    return this;
  }
}

module.exports = Anim;
