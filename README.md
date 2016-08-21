# ttock
**ttock** is a simple browser-based stopwatch/timer utility.

![ttock screenshot](screenshot.png?raw=true "ttock screenshot")

It is released under the GPLv3.

## Purpose
This utility was created to provide reliable resting periods during exercise.

## UI
**ttock** is intended to be extremely simple to use on both mobile and desktop browsers. Towards this end, the user emits a single key press, touch, or mouse click and the duration held dictates the functionality that is used. See *Controls* for more information.

The UI is split into the following sections:

  * **Input Time** -- input time in milliseconds
    * The timer will emit a sound and the timer will change visually when this is reached
  * **Main Timer** -- tracks the current time in milliseconds
  * **Total Timer** -- tracks the current total time in milliseconds

## Controls
  * **Start/Pause** -- Click the stopwatch or press the spacebar
    * This starts or pauses the main timer
  * **Reset** -- Click the stopwatch or press the spacebar and hold for at least 200 milliseconds
    * This resets the main timer
  * **Reset All** -- Click the stopwatch or press the spacebar and hold for at least 750 milliseconds
    * This resets the main timer and the total timer
