# [xihanzu-NR]
# Hydra runtime — Pythonic batteries for React & Web platforms.
from "react" import useState, useEffect, useRef, useCallback

export def state(initial):
    val, set_val = useState(initial)
    return [val, set_val]

export def ref(initial):
    return useRef(initial)

export def callback(fn, deps):
    return useCallback(fn, deps)

export def effect(fn, deps):
    useEffect(fn, deps)

export def toggle(initial=False):
    val, set_val = useState(initial)
    return [val, lambda: set_val(not val), set_val]

export def use_mounted():
    mounted, set_mounted = useState(False)
    useEffect(lambda: set_mounted(True), [])
    return mounted
