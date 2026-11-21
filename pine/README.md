# ICT Dealing Range [BlueSock]

Pine Script v6 overlay (`ict_dealing_range.pine`). It is a clean-room take on the feature set of
"ICT Dealing Range [Pro] (fadi)". That script is invite-only, so its source was never read. Only its
public input list served as the spec.

## How it works
- **Swing hierarchy (ICT):** Short-term swing = 3-bar fractal. Intermediate = an ST swing with lower
  (higher for lows) ST swings on both sides. Long-term = the same rule applied to IT swings.
- **Dealing range per term:** the latest swing high and swing low of that term. When price trades
  through a boundary, that boundary moves to the new extreme.
- **Fib orientation:** level 0 is the most recent extreme of the leg and level 1 is its origin. So in a
  bullish leg 0.618/0.786 sit in discount, and the negative levels (-1/-2/-3) project beyond the leg.
- **Log scale** option for the fib math (default on).
- **Display:** each enabled range is drawn as a premium/discount box to the right of price, with
  configurable distance, width, spacing, order, padding, labels and transparency.
- **Trace lines** run from the anchoring swing candles to the box: "Open" goes to level 1, "Close" to level 0.
- **Alerts:** an equilibrium (0.5) cross and a range break for each of ST, IT and LT.
- Range values appear in the Data Window.

## Install
TradingView → Pine Editor → paste the file → *Add to chart*.
