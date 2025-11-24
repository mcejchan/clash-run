Summary

 Split the single 800×600 canvas into two synchronized 800×600 viewports
 rendered on a single 1600×600 canvas so each player always sees themselves
  centered on their half of the screen while sharing one world state.


 Implementation Plan
 1. Canvas & Layout
   •  Update gameCanvas initialization to 1600×600 and treat it as two
      800×600 regions (left for Player 1, right for Player 2).
   •  Add lightweight CSS (if needed) to keep the canvas responsive inside
      the existing layout while preserving the doubled width.

 2. Player Module (camera state)
   •  Track per-player camera offsets instead of the single world object:
      one offset follows Player 1, another follows Player 2.
   •  Expose helpers like Player.getCamera(playerId) (or
      getCameraOffsets()) so other systems can request the correct camera
      center for each viewport.
   •  Keep getWorldOffset() for backward compatibility by returning
      Player 1’s camera so existing UI/logic keeps working until updated.

 3. Input Adjustments
   •  Extend mouse-direction helpers to figure out which half of the
      canvas the mouse is in and compute aim vectors relative to that
      viewport’s center (Player 1 on left, Player 2 on right). Keyboard
      bindings remain unchanged.

 4. Rendering Refactor
   •  Introduce a renderViewport({camera, originX, width}) helper that
      clips to one half, clears it, draws
      grid/obstacles/projectiles/enemies, then renders both players
      relative to that camera.
   •  Update all draw helpers (drawPlayer, drawRobot, etc.) to accept
      camera and viewportOrigin parameters instead of reading the global
      Player.getWorldOffset() so they can be reused for both halves
      without duplicating logic.
   •  Within Rendering.render(), call renderViewport twice (left/right)
      passing each player’s camera offsets; ensure HUD overlays (like
      mini-maps) still render once outside the clipped regions.

 5. UI Updates
   •  Show both players’ world positions (e.g., Pozice H1 / Pozice H2) so
      the info panel reflects the dual-camera setup.
   •  Ensure cooldown/HP elements already present continue working without
      change.

 6. Validation
   •  After implementation run npm test (the project’s provided test
      script) to satisfy the validation gate.