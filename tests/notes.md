render sheet to array of {chord,index}
each el that isMajorChord => add possible roots to element
=> either root of chord or fifth (e.g. F^7 is in F or C)
now start at each major chord and walk to the left and right adding the possible roots until another major chord hit
=> e.g. | D-7 G7 | C^7 | C-7 F7 | Bb^7 |
| C or G | C or G | C or G, Bb or F | Bb or F |
render function + type of each chord in the possible roots
=> e.g. D-7 = {root:'C',function: 'II-7',type:'diatonic'},{root:'G',function:'II/IV',type:'secondary'}
each function type has a priorization

- diatonic = 1, secondary = 2, substitute = 3
  calculate sum of priorizations
  => D-7 + G7 + C^7 + C-7 + F7
  => C: diationic + diatonic + diatonic + substitute + substitute = 9
  => G: secondary + secondary + diatonic + substitute + substitute = 11
  accept smaller sum as more likely (F or Bb is similar):
  => e.g. | D-7 G7 | C^7 | C-7 F7 | Bb^7 |
  | C | C | C or Bb | Bb |
  the chords that still have two possibilities are regared as pivot transitions
  possible problems: are there sheets that have no major chords?
  what about minor modes?
  outlook:
- can now decide which scale is best (based on function to scale mappings)
- can now color correctly based on root
  -- use gradients on pivots!!!!!
