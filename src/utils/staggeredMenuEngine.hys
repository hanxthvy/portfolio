# [xihanzu-NR]
from "gsap" import gsap

export def init_menu_gsap(panel, pre_layers, plus_h, plus_v, icon, text_inner):
    try:
        layers = gsap.utils.toArray(pre_layers)
        if panel:
            gsap.set(panel, {"xPercent": 100, "opacity": 1})
        if len(layers) > 0:
            gsap.set(layers, {"xPercent": 100, "opacity": 1})
        if plus_h:
            gsap.set(plus_h, {"transformOrigin": "50% 50%", "rotate": 0})
        if plus_v:
            gsap.set(plus_v, {"transformOrigin": "50% 50%", "rotate": 90})
        if icon:
            gsap.set(icon, {"rotate": 0, "transformOrigin": "50% 50%"})
        if text_inner:
            gsap.set(text_inner, {"yPercent": 0})
    except:
        pass

export def play_open_menu(panel, pre_layers, on_complete=None):
    try:
        if not panel:
            return None

        layers = gsap.utils.toArray(pre_layers)
        item_els = gsap.utils.toArray(panel.querySelectorAll(".sm-panel-itemLabel"))
        number_els = gsap.utils.toArray(panel.querySelectorAll(".sm-panel-num"))
        social_links = gsap.utils.toArray(panel.querySelectorAll(".sm-socials-link"))

        if len(item_els) > 0:
            gsap.set(item_els, {"yPercent": 140, "rotate": 10})
        if len(number_els) > 0:
            gsap.set(number_els, {"opacity": 0})
        if len(social_links) > 0:
            gsap.set(social_links, {"y": 25, "opacity": 0})

        tl = gsap.timeline({
            "paused": True,
            "onComplete": lambda: on_complete() if on_complete else None,
        })

        if len(layers) > 0:
            layers.forEach(lambda layer, idx: tl.fromTo(layer, {"xPercent": 100}, {"xPercent": 0, "duration": 0.5, "ease": "power4.out"}, idx * 0.07))

        last_time = (len(layers) - 1) * 0.07 if len(layers) > 0 else 0
        panel_start = last_time + (0.08 if len(layers) > 0 else 0)

        tl.fromTo(panel, {"xPercent": 100}, {"xPercent": 0, "duration": 0.65, "ease": "power4.out"}, panel_start)

        items_start = panel_start + 0.1
        if len(item_els) > 0:
            tl.to(item_els, {"yPercent": 0, "rotate": 0, "duration": 0.8, "ease": "power4.out", "stagger": 0.08}, items_start)

        if len(number_els) > 0:
            tl.to(number_els, {"opacity": 1, "duration": 0.5, "ease": "power2.out", "stagger": 0.06}, items_start + 0.1)

        if len(social_links) > 0:
            tl.to(social_links, {"y": 0, "opacity": 1, "duration": 0.5, "ease": "power3.out", "stagger": 0.06}, items_start + 0.2)

        tl.play(0)
        return tl
    except:
        return None

export def play_close_menu(panel, pre_layers, on_complete=None):
    try:
        if not panel:
            return None

        layers = gsap.utils.toArray(pre_layers)
        targets = [panel] + list(layers)

        def handle_done():
            item_els = gsap.utils.toArray(panel.querySelectorAll(".sm-panel-itemLabel"))
            if len(item_els) > 0:
                gsap.set(item_els, {"yPercent": 140, "rotate": 10})
            number_els = gsap.utils.toArray(panel.querySelectorAll(".sm-panel-num"))
            if len(number_els) > 0:
                gsap.set(number_els, {"opacity": 0})
            social_links = gsap.utils.toArray(panel.querySelectorAll(".sm-socials-link"))
            if len(social_links) > 0:
                gsap.set(social_links, {"y": 25, "opacity": 0})
            if on_complete:
                on_complete()

        return gsap.to(targets, {
            "xPercent": 100,
            "duration": 0.32,
            "ease": "power3.in",
            "overwrite": "auto",
            "onComplete": handle_done,
        })
    except:
        return None

export def animate_menu_icon(icon, plus_h, plus_v, opening):
    try:
        if not plus_h or not plus_v:
            return None
        tl = gsap.timeline({"defaults": {"ease": "power4.out" if opening else "power3.inOut"}})
        if opening:
            tl.to(plus_h, {"rotate": 45, "duration": 0.4}, 0)
            tl.to(plus_v, {"rotate": -45, "duration": 0.4}, 0)
        else:
            tl.to(plus_h, {"rotate": 0, "duration": 0.3}, 0)
            tl.to(plus_v, {"rotate": 90, "duration": 0.3}, 0)
        return tl
    except:
        return None

export def animate_menu_text(text_inner, is_open):
    try:
        if not text_inner:
            return None
        target_shift = -50 if is_open else 0
        return gsap.to(text_inner, {"yPercent": target_shift, "duration": 0.4, "ease": "power4.out"})
    except:
        return None
