# [xihanzu-NR]
from "gsap" import gsap

export def split_indexed_chars(text):
    return text.split("").map(lambda c, idx: {"char": c, "key": idx})

export def measure_bbox(node, stroke_width, font_size):
    try:
        bbox = node.getBBox()
        if not bbox or not bbox.width:
            return None
        pad = Math.max(stroke_width, font_size * 0.1)
        return {
            "x": bbox.x - pad,
            "y": bbox.y - pad,
            "width": bbox.width + pad * 2,
            "height": bbox.height + pad * 2,
        }
    except:
        return None

export def is_box_equal(b1, b2):
    if not b1 or not b2:
        return False
    dx = Math.abs(b1["x"] - b2["x"])
    dy = Math.abs(b1["y"] - b2["y"])
    dw = Math.abs(b1["width"] - b2["width"])
    dh = Math.abs(b1["height"] - b2["height"])
    return dx < 0.5 and dy < 0.5 and dw < 0.5 and dh < 0.5

export def animate_stroke(root, wipe_rect, box_width, dash, draw_duration, fill_delay, stagger, ease, fill_mode):
    try:
        strokes = gsap.utils.toArray(root.querySelectorAll("[data-stroke-char]"))
        fills = gsap.utils.toArray(root.querySelectorAll("[data-fill-char]"))
        if not strokes or len(strokes) == 0:
            return None

        gsap.set(strokes, {"strokeDasharray": dash, "strokeDashoffset": dash})
        gsap.set(fills, {"opacity": 1 if fill_mode == "wipe" else 0})
        if wipe_rect:
            gsap.set(wipe_rect, {"attr": {"width": 0}})

        tl = gsap.timeline({"defaults": {"overwrite": "auto"}})
        tl.to(strokes, {"strokeDashoffset": 0, "duration": draw_duration, "ease": ease, "stagger": stagger}, 0)

        fill_duration = Math.max(0.4, draw_duration * 0.5)
        if fill_mode == "wipe" and wipe_rect:
            tl.to(wipe_rect, {"attr": {"width": box_width}, "duration": fill_duration, "ease": "power2.inOut"}, draw_duration + fill_delay)
        elif fill_mode != "none":
            tl.to(fills, {"opacity": 1, "duration": fill_duration, "ease": "power2.out", "stagger": stagger}, draw_duration + fill_delay)

        return tl
    except:
        return None
