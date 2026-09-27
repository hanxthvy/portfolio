# [xihanzu-NR]

export def set_ref(ref, val):
    Object.assign(ref, {"current": val})

export def set_canvas_size(canvas, width, height):
    Object.assign(canvas, {"width": width, "height": height})

export def ease_func(t, easing):
    if easing == "linear":
        return t
    if easing == "ease-in":
        return t * t
    if easing == "ease-in-out":
        return 2 * t * t if t < 0.5 else -1 + (4 - 2 * t) * t
    return t * (2 - t)

export def create_sparks(x, y, count, now):
    pi2 = 6.283185307179586
    steps = [0, 1, 2, 3, 4, 5, 6, 7]
    return [
        {
            "x": x,
            "y": y,
            "angle": (s * pi2) / count,
            "startTime": now,
        }
        for s in steps
    ]

export def render_sparks(ctx, width, height, sparks, timestamp, duration, spark_radius, extra_scale, spark_size, spark_color, easing):
    ctx.clearRect(0, 0, width, height)
    active = []
    Object.assign(ctx, {"strokeStyle": spark_color, "lineWidth": 2})
    for s in sparks:
        elapsed = timestamp - s["startTime"]
        if elapsed < duration:
            progress = elapsed / duration
            eased = ease_func(progress, easing)
            dist = eased * spark_radius * extra_scale
            line_len = spark_size * (1 - eased)
            x1 = s["x"] + dist * Math.cos(s["angle"])
            y1 = s["y"] + dist * Math.sin(s["angle"])
            x2 = s["x"] + (dist + line_len) * Math.cos(s["angle"])
            y2 = s["y"] + (dist + line_len) * Math.sin(s["angle"])
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            active.append(s)
    return active
