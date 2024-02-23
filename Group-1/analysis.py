# Compute FEMs for a single span
def calculate_fem_for_span(span_boundary: tuple, span_loads: list) -> tuple[float, float]:
    """
    Calculates FEMs for a single span based on its loads.

    Returns:
        object: A tuple of the form (fem1, fem2) representing the fixed end moments at the
        left and right ends of the span.
    """
    span_length = float(span_boundary[1]) - float(span_boundary[0])
    L = span_length
    fem1 = 0
    fem2 = 0

    # What if the span has more than one load type?
    # What if the span has more than one load of the same type?
    # What if the span has no loads?

    # No load on span
    if len(span_loads) == 0:
        return 0, 0

    # For 1 or more loads on span
    # Multiple load types on span, if there is more than one load type, calculate fem1 and fem 2 for each load type
    # and add them together as such: fem1 = fem1_load1 + fem1_load2 + fem1_load3 + ... fem2 = fem2_load1 + fem2_load2
    # + fem2_load3 + ...

    elif len(span_loads) >= 1:
        fem1 = 0
        fem2 = 0

        for load_data in span_loads:
            if load_data.l_type == "point":
                p, a = float(load_data.magnitude), float(load_data.position) - float(span_boundary[0])
                b = L - a
                fem1 += (-1) * p * a * (b ** 2) / L ** 2
                fem2 += p * b * (a ** 2) / L ** 2

            elif load_data.l_type == "udl":
                if float(load_data.coverage) == L:  # UDL spanning entire span
                    w = float(load_data.magnitude)
                    fem1 += (-1) * w * L ** 2 / 12
                    fem2 += w * L ** 2 / 12
                elif float(load_data.coverage) < L:  # UDL spanning part of the span
                    a, b, w = (float(load_data.coverage), span_length - float(load_data.coverage),
                               float(load_data.magnitude))
                    fem1 += (-1) * w * a ** 2 * (6 * L ** 2 - 8 * a * L + 3 * a ** 2) / (12 * L ** 2)
                    fem2 += w * a ** 3 * (4 * L - 3 * a) / (12 * L ** 2)
                elif load_data.position > float(span_boundary[0]) and load_data.coverage < L:  # Spanning any portion
                    # of span.
                    a = load_data.position - float(span_boundary[0])
                    span = float(load_data.coverage)
                    w = float(load_data.magnitude)
                    c = a + (span / 2)
                    d = L - c
                    fem1 += -(w * span / L ** 2) * (c * d * d + ((c - 2 * d) * (span ** 2 / 12)))
                    fem2 += (w * span / L ** 2) * (d * c * c + ((d - 2 * c) * (span ** 2 / 12)))

            elif load_data.l_type == "moment":
                m, a = float(load_data.magnitude), float(load_data.position) - float(span_boundary[0])
                b = L - a
                fem1 += m * b * (2 * a - b) / L ** 2
                fem2 += m * a * (2 * b - a) / L ** 2

    return fem1, fem2

