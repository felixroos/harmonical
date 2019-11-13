import { renderPiano } from 'svg-piano';
import { Voicing } from '../lib/Voicing';
import { Chord, Distance, Note, Interval } from 'tonal';
import { Harmony } from '../lib/Harmony';
import { getStepFromInterval, getDegreeFromInterval, noteArrayMidi } from '../lib/util';
import Tone from 'tone';

var synth = new Tone.PolySynth(20, Tone.Synth).toMaster();
synth.set({
  envelope: {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.8,
    release: 0.01
  },
  oscillator: {
    type: 'fmtriangle'
  }
});
/**
 * 
 * add possibility of choosing scales instead of chords with required degrees:
 * dorian, required degrees 6. then treat scale as chord notes with same rules applied!
 * 
 * add possibility of showing all voicings inside a range without fixed bottom octave
 * => also add lower interval limits!
 */
/** 
 * sine, square, triangle, sawtooth. Or prefix the basic types with “fm”, “am”, or “fat” to use the FMOscillator, AMOscillator or FatOscillator types. The oscillator could also be set to “pwm” or “pulse”
 */
synth.volume.value = -12;

let activeNotes = [];
let mousedown = false;
document.addEventListener('mousedown', () => {
  mousedown = true;
})
document.addEventListener('mouseup', () => {
  mousedown = false;
  synth.releaseAll();
  activeNotes = [];
})
// synth.set("volume", -6);

window.onload = function () {

  function parseValues(ids, defaultValues = {}) {
    return {
      ...defaultValues,
      ...ids.reduce((values, id) => ({ ...values, [id]: document.getElementById(id)['value'] }), {})
    }
  }

  function writeValues(ids, values) {
    ids.forEach(id => {
      if (values[id] !== undefined && document.getElementById(id)) {
        document.getElementById(id)['value'] = values[id];
      }
    })
  }

  function onEvent(ids, event, callback) {
    ids.forEach(id => {
      document.getElementById(id).addEventListener(event, callback);
    })
  }

  const ids = [
    'minNotes',
    'maxNotes',
    /* 'bottomPitches', */
    /* 'topPitches', */
    'defaultDistances',
    'bottomDistances',
    'topDistances',
    'arpeggioInterval',
    'bottomDegrees',
    'topDegrees'];

  let options = parseValues(ids);
  onEvent(ids, 'keyup', (value, id) => {
    options = parseValues(ids);
    // parseChord(options.chord, options);
    updateChord();
  });

  const defaultChord = 'D-9';

  let sortProp = 'topMidi';

  function updateChord() {
    const root = document.getElementById('chordRoot')['value'];
    const type = document.getElementById('chordType')['value'];
    if (root && type) {
      parseChord(root + type, options);
    }
  }

  document.getElementById('chordRoot').addEventListener('change', updateChord);
  document.getElementById('chordType').addEventListener('change', updateChord);

  document.getElementById('sortBy').addEventListener('change', (e) => {
    if (e.target['value']) {
      sortProp = e.target['value'];
      updateChord();
      /* parseChord(options.chord, options); */
    }
  });

  let wavetype = 'fmsine';
  document.getElementById('wavetype').addEventListener('change', (e) => {
    if (e.target['value']) {
      wavetype = e.target['value'];
      synth.set({
        oscillator: {
          type: wavetype
        }
      });
    }
  });

  parseChord(defaultChord, options);

  function renderVoicings(chord = defaultChord, options = {}) {
    // const notes = Chord.notes(Harmony.getTonalChord(chord));
    document.getElementById('piano').innerHTML = '';

    options = {
      ...options,
      chord,
      bottomPitches: options['bottomPitches'] || '',
      maxNotes: parseInt(options['maxNotes']) || 5,
      minNotes: parseInt(options['minNotes']) || parseInt(options['maxNotes']) || 5,
      /* maxVoices: parseInt(options['maxVoices']) || 4, */
      /* minDistance: parseInt(options['minDistance']) || 1,
      maxDistance: parseInt(options['maxDistance']) || 7, */
      defaultDistances: options['defaultDistances'] || '1-7',
      bottomDistances: options['bottomDistances'] || '5-15 2-8',
      topDistances: options['topDistances'] || '3-7',
      arpeggioInterval: parseInt(options['arpeggioInterval']) || 200,
      bottomDegrees: options['bottomDegrees'] || '1 3,5,7',
    }

    writeValues(ids, options)


    /* console.log('options', options); */

    /* const required = Voicing.getRequiredNotes(chord, options['maxVoices']); */
    const { requiredPitches, optionalPitches } = Voicing.getPitches(chord, options['maxNotes']);
    document.getElementById('piano').innerHTML += 'Required: ' + requiredPitches.join(' ') + '<br/>';
    document.getElementById('piano').innerHTML += 'Optional: ' + optionalPitches.join(' ') + '<br/><br/>';

    const voicingRange = ['A1', 'C5'];

    const voicingOptions = {
      ...options,
      notes: [options['minNotes'], options['maxNotes']] || 5,
      bottomPitches: options['bottomPitches'] ? options['bottomPitches'].split(' ') : [],
      topPitches: options['topPitches'] ? options['topPitches'].split(' ') : [],
      bottomDegrees: options['bottomDegrees'] ? options['bottomDegrees'].trim().split(' ').map(d => d.split(',').map(_d => parseInt(_d))) : [],
      topDegrees: options['topDegrees'] ? options['topDegrees'].trim().split(' ').map(d => d.split(',').map(_d => parseInt(_d))) : [],
      // minDistances: options['minDistances'] ? options['minDistances'].split(' ').map(d => parseInt(d)) : [],
      // maxDistances: options['maxDistances'] ? options['maxDistances'].split(' ').map(d => parseInt(d)) : [],
      bottomDistances: options['bottomDistances'] ? options['bottomDistances'].trim().split(' ').map(d => d.split('-').map(d => parseInt(d))) : [],
      topDistances: options['topDistances'] ? options['topDistances'].trim().split(' ').map(d => d.split('-').map(d => parseInt(d))) : [],
      defaultDistances: options['defaultDistances'] ? options['defaultDistances'].trim().split('-').map(d => parseInt(d)) : [],
      range: voicingRange,
    };
    console.log('options', voicingOptions);
    /* let voicings = Voicing.getAllVoicePermutations(chord, voicingOptions); */

    let voicings = Voicing.getCombinations(chord, voicingOptions);
    /* const voicings = Voicing.search(notes, {
      minNotes: notes.length,
      maxNotes: notes.length,
    }); */

    document.getElementById('piano').innerHTML += voicings.length + ' valid voicing(s) found:<br/>';


    function voicingProps(voicing, root = Note.pc(voicing[0])) { // voicing with first note as bass
      const pitches = voicing./* slice(1). */map(note => Note.pc(note));
      const steps = pitches.map(pitch => getStepFromInterval(Distance.interval(root, pitch)));
      const intervals = pitches.reduce((intervals, pitch, index) => index ? intervals.concat(
        [<string>Distance.interval(<string>pitches[index - 1], <string>pitch)]
      ) : [], []);
      const semitones = intervals.map(interval => Interval.semitones(interval));
      const spread = Distance.interval(voicing[0], voicing[voicing.length - 1]);
      const semitoneSpread = Interval.semitones(<string>spread);
      const avgSpread = Math.floor(semitoneSpread / voicing.length);
      const averageDistance = semitones.reduce((avg, semitones) => avg + semitones, 0) / semitones.length
      const leapSemitones = Math.max(...semitones) - Math.min(...semitones);
      const leap = Interval.fromSemitones(leapSemitones);
      const topMidi = Note.midi(voicing[voicing.length - 1]);
      const topDegree = getDegreeFromInterval(<string>Distance.interval(root, pitches[pitches.length - 1]));
      const bottomDegree = getDegreeFromInterval(<string>Distance.interval(root, pitches[0]));
      const bottomMidi = Note.midi(voicing[0]);
      const midiMedian = voicing.reduce((sum, note) => sum + Note.midi(note), 0) / voicing.length;
      // TODO:
      // amount of different interval types: (3m 3M = 1) (4P 3m = 2)
      // standard deviation from median interval
      // degree stack: [1,[3,5,7]]
      return {
        root, pitches, steps, intervals, semitones, spread, semitoneSpread, averageDistance, leap, leapSemitones,
        topMidi, bottomMidi, midiMedian, topDegree, bottomDegree, avgSpread
      }
    }


    const root = Harmony.getBassNote(chord, true) || '';

    voicings = voicings
    /* .map(voicing => {
      // add bass note
      if (root) { // && options['addRootBass']
        voicing = [root + bassOctave].concat(voicing);
      }
      return voicing
    }); */
    const props = voicings.map(voicing => voicingProps(voicing, root));
    voicings.sort((a, b) => props[voicings.indexOf(a)][sortProp] - props[voicings.indexOf(b)][sortProp])
      .forEach(voicing => {
        voicing = voicing.map(note => Note.simplify(note));
        const container = document.createElement('div');
        renderPiano(container, {
          range: ['A0', 'C7'],
          // range: ['C' + bassOctave, 'C' + (bassOctave + 6)],
          scaleY: 0.3,
          scaleX: 0.5,
          colorize: [
            {
              keys: voicing,
              color: 'yellow'
            },
            {
              keys: noteArrayMidi([Note.midi('A0'), Note.midi(voicingRange[0]) - 1]),
              color: 'transparent'
            },
            {
              keys: noteArrayMidi([Note.midi(voicingRange[1]) + 1, Note.midi('C8')]),
              color: 'transparent'
            }
          ]
        });
        let { steps, intervals, spread, avgSpread } = voicingProps(voicing, root);

        const playButton = document.createElement('button');
        playButton.innerHTML = '[ ' + steps.join(' ') + ' ] ' + intervals.join(' ') + ' | ' + voicing.join(' ') + ' | ' + spread + ' | ' + avgSpread;// ' / ' + semitones.join(' ') + ' ]';
        function playVoicing(interval = 0) {
          //synth.triggerAttack(voicing.filter(note => !activeNotes.includes(note)));
          voicing.filter(note => !activeNotes.includes(note)).forEach((note, index) => {
            synth.triggerAttack(note, "+" + ((index) * interval));
          })
          synth.triggerRelease(activeNotes.filter(note => !voicing.includes(note)));
          activeNotes = [].concat(voicing);
        }

        playButton.addEventListener('mousedown', () => playVoicing(options['arpeggioInterval'] / 1000));
        playButton.addEventListener('mouseover', () => {
          if (mousedown) {
            playVoicing(0);
          }
        });

        container.appendChild(playButton);
        container.addEventListener('mousedown', () => playVoicing)
        document.getElementById('piano').appendChild(container);
      });
  }

  function parseChord(chord, options = {}) {
    const notes = Chord.notes(Harmony.getTonalChord(chord));
    if (notes) {
      renderVoicings(chord, options);
    }
  }

}