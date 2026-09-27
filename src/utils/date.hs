# [xihanzu-NR]
export def now_ms():
    return Date.now()

export def get_age(birth="2009-04-10"):
    b = Date.parse(birth)
    now = Date.now()
    diff = now - b
    years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    return years

export def get_wib_time():
    now = Date.now()
    offset_ms = 7 * 60 * 60 * 1000
    wib_ms = now + offset_ms
    sec_total = Math.floor(wib_ms / 1000)
    s = sec_total % 60
    m = Math.floor(sec_total / 60) % 60
    h = Math.floor(sec_total / 3600) % 24
    s_str = f"0{s}" if s < 10 else f"{s}"
    m_str = f"0{m}" if m < 10 else f"{m}"
    h_str = f"0{h}" if h < 10 else f"{h}"
    return f"{h_str}:{m_str}:{s_str}"
