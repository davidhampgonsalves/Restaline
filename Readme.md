# Restaline - SVG fills for pen plotters

<img src="https://github.com/davidhampgonsalves/Restaline/raw/main/example.png" />

# TODO

- surface progress somehow
- fill using fixed angle
- order paths to avoid smugging
- Split up final paths into groups, or files?
- host on github pages

# Bugs

- missing edges on rocket
- Unioning flipping fill on fish
- duplicated edge lines... take top(can't do for complex paths) or inset all closed paths?

## Gcode

```
find fish-bordered-*.svg -exec vpype read {} gwrite -p midt {}.nc \;
```

## Development

`python3 -m http.server 8000`

## Tests

When running locally [http://local.host:8000/tests]
