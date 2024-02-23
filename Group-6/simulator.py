import tkinter as tk
from sympy import symbols, Eq, solve
from utils import Span, Node

#Initialise Input Variables
number_of_spans = 0
span_lengths = []
loads = []
loading_conditions = []
multipliers = []
settlement_positions = []
settlement_values = []
settlement_on_beam = ""
first_node_fixed = ""
last_node_fixed = ""
number_of_settlements = 0
E = 0
I = 0

solution = {}

def add_new_span():
    new_span = tk.Frame(span_list)
    new_span.grid(sticky="ew")
    
    span_length_label = tk.Label(new_span, text="Span Length:")
    span_length_label.grid(row=0, column=0, sticky="w")
    span_length_entry = tk.Entry(new_span)
    span_length_entry.grid(row=0, column=1, sticky="ew")

    load_label = tk.Label(new_span, text="Load:")
    load_label.grid(row=1, column=0, sticky="w")
    load_entry = tk.Entry(new_span)
    load_entry.grid(row=1, column=1, sticky="ew")

    loading_condition_label = tk.Label(new_span, text="Loading Condition:")
    loading_condition_label.grid(row=2, column=0, sticky="w")
    loading_condition_entry = tk.Entry(new_span)
    loading_condition_entry.grid(row=2, column=1, sticky="ew")

    multiplier_label = tk.Label(new_span, text="Multiplier:")
    multiplier_label.grid(row=3, column=0, sticky="w")
    multiplier_entry = tk.Entry(new_span)
    multiplier_entry.grid(row=3, column=1, sticky="ew")

    remove_button = tk.Button(new_span, text="Remove", command=lambda: remove_span(new_span))
    remove_button.grid(row=4, columnspan=2, sticky="ew")

    update_spans_count()

def add_new_settlement():
    new_settlement = tk.Frame(settlement_list)
    new_settlement.grid(sticky="ew")
    
    settlement_positions_label = tk.Label(new_settlement, text="Settlement Positions:")
    settlement_positions_label.grid(row=0, column=0, sticky="w")
    settlement_positions_entry = tk.Entry(new_settlement)
    settlement_positions_entry.grid(row=0, column=1, sticky="ew")

    settlement_values_label = tk.Label(new_settlement, text="Settlement Values:")
    settlement_values_label.grid(row=1, column=0, sticky="w")
    settlement_values_entry = tk.Entry(new_settlement)
    settlement_values_entry.grid(row=1, column=1, sticky="ew")

    remove_button = tk.Button(new_settlement, text="Remove", command=lambda: remove_settlement(new_settlement))
    remove_button.grid(row=2, columnspan=2, sticky="ew")

    update_settlement_count()

def remove_span(span):
    span.destroy()
    update_spans_count()

def remove_settlement(settlement):
    settlement.destroy()
    update_settlement_count()

def update_spans_count():
    global number_of_spans
    number_of_spans = len(span_list.winfo_children())
    spans_count_label.config(text=str(number_of_spans))

def update_settlement_count():
    global number_of_settlements
    number_of_settlements = len(settlement_list.winfo_children())
    settlements_count_label.config(text=str(number_of_settlements))

def handle_settlement_of_beam_params(event):
    if settlement_on_beam_var.get() == 'yes':
        add_settlement_button.grid(row=9, column=0, columnspan=2, sticky="ew", padx=10, pady=5)
    else:
        add_settlement_button.grid_forget()

def calculate_deflection():
    global span_lengths, loads, loading_conditions, multipliers, number_of_spans, settlement_on_beam, first_node_fixed, last_node_fixed, settlement_positions, settlement_values, number_of_settlements, E, I
    form_data = extract_form_data()
    
    span_lengths = [int(data['span_length']) for data in form_data['span_data']]
    loads = [int(data['load']) for data in form_data['span_data']]
    loading_conditions = [data['loading_condition'] for data in form_data['span_data']]
    multipliers = [int(data['multiplier']) for data in form_data['span_data']]
    number_of_spans = form_data['number_of_spans']
    settlement_on_beam = form_data['settlement_on_beam']
    first_node_fixed = form_data['first_node_fixed']
    last_node_fixed = form_data['last_node_fixed']
    
    settlement_positions = [int(data['settlement_positions']) for data in form_data['settlement_data']]
    settlement_values = [int(data['settlement_values']) for data in form_data['settlement_data']]
    
    # Convert number_of_settlements to an integer
    number_of_settlements = int(form_data['number_of_settlements'])
    
    E = int(e_entry.get())
    I = int(i_entry.get())
    
    print_data()

def print_data():
    print("Span Lengths:", span_lengths)
    print("Loads:", loads)
    print("Loading Conditions:", loading_conditions)
    print("Multipliers:", multipliers)
    print("Number of Spans:", number_of_spans)
    print("Settlement on Beam:", settlement_on_beam)
    print("First Node Fixed:", first_node_fixed)
    print("Last Node Fixed:", last_node_fixed)
    print("Settlement Positions:", settlement_positions)
    print("Settlement Values:", settlement_values)
    print("Number of Settlements:", number_of_settlements)
    print("Value of E:", E)
    print("Value of I:", I)

def extract_form_data():
    span_data = []
    for span_frame in span_list.winfo_children():
        span_length = span_frame.grid_slaves(row=0, column=1)[0].get()
        load = span_frame.grid_slaves(row=1, column=1)[0].get()
        loading_condition = span_frame.grid_slaves(row=2, column=1)[0].get()
        multiplier = span_frame.grid_slaves(row=3, column=1)[0].get()
        span_data.append({
            'span_length': span_length,
            'load': load,
            'loading_condition': loading_condition,
            'multiplier': multiplier
        })

    settlement_data = []
    for settlement_frame in settlement_list.winfo_children():
        settlement_positions = settlement_frame.grid_slaves(row=0, column=1)[0].get()
        settlement_values = settlement_frame.grid_slaves(row=1, column=1)[0].get()
        settlement_data.append({
            'settlement_positions': settlement_positions,
            'settlement_values': settlement_values
        })

    settlement_on_beam = settlement_on_beam_var.get()
    first_node_fixed = first_node_fixed_var.get()
    last_node_fixed = last_node_fixed_var.get()
    number_of_spans = len(span_data)
    number_of_settlements = len(settlement_data)

    return {
        'span_data': span_data,
        'settlement_data': settlement_data,
        'settlement_on_beam': settlement_on_beam,
        'first_node_fixed': first_node_fixed,
        'last_node_fixed': last_node_fixed,
        'number_of_spans': number_of_spans,
        'number_of_settlements': number_of_settlements
    }



def engine():
    number_of_supports = number_of_spans + 1

    # store all the supports in a list, and make every support an instance of the class 'Node'
    supports = []
    settlement_variable = 0
    slope_variable = 0
    equilibrium_equation_variable = ""
    node_reaction_variable = 0
    for i in range(number_of_supports):
        supports.append("")
        supports[i] = Node(settlement_variable, slope_variable, equilibrium_equation_variable,
                            node_reaction_variable)

    # store slopes in a list. make all the unknown slopes sympy symbols, and store them in a list, first and last are always = 0
    list_of_unknown_slopes = []
    first_node = "A"
    for i in range(number_of_supports):
        if i != 0 and i != number_of_supports - 1:
            supports[i].slope = symbols(f"Theta_{first_node}")
            list_of_unknown_slopes.append(supports[i].slope)
        else:
            supports[i].slope = symbols(f"Theta_{first_node}")
            supports[i].slope = 0

        first_node = chr(ord(first_node) + 1)

    # store all the span values in a list, and makes every node an instance of the class 'Span'
    beam_spans = []
    left_fem_variable = 1
    right_fem_variable = 1
    span_length_variable = 1
    load_variable = 1
    loading_condition_variable = ""
    delta_variable = 1
    left_moment_variable = 1
    right_moment_variable = 1
    left_slope_deflection_equation_variable = ""
    right_slope_deflection_equation_variable = ""
    reaction_at_left_node_on_span_variable = 1
    reaction_at_right_node_on_span_variable = 1
    span_a_value_variable = 1
    moment_of_inertia_multiplier_variable = 1

    for i in range(number_of_spans):
        beam_spans.append("")
        beam_spans[i] = Span(left_fem_variable, right_fem_variable, span_length_variable, load_variable,
                            loading_condition_variable, delta_variable, left_moment_variable,
                            right_moment_variable, left_slope_deflection_equation_variable,
                            right_slope_deflection_equation_variable, reaction_at_left_node_on_span_variable,
                            reaction_at_right_node_on_span_variable, span_a_value_variable,
                            moment_of_inertia_multiplier_variable)


    list_of_end_moments = []
    length_of_beam = 0
    list_of_slope_deflection_equations = []
    list_of_equilibrium_equations = []
    equations = []
    unknowns = []
    solution = {}

    # Calculate FEM
    def calculate_fem():
        print("Key words for loading condition:"
            "\nNo loading on span (none)"
            "\nPoint load at center (P_C)"
            "\nPoint load at distance 'a' from left end and 'b' from the right end (P_X)"
            "\nTwo equal point loads, spaced at 1/3 of the total length from each other (P_C_2)"
            "\nThree equal point loads, spaced at 1/4 of the total length from each other (P_C_3)"
            "\nUniformly distributed load over the whole length (UDL)"
            "\nUniformly distributed load over half of the span on the right side (UDL/2_R)"
            "\nUniformly distributed load over half of the span on the left side (UDL/2_L)"
            "\nVariably distributed load, with highest point on the right end (VDL_R)"
            "\nVariably distributed load, with highest point on the left end (VDL_L)"
            "\nVariably distributed load, with highest point at the center (VDL_C)")
        for i in range(number_of_spans):
            beam_spans[i].loading_condition = loading_conditions[i]
            beam_spans[i].span_length = span_lengths[i]
            beam_spans[i].load = loads[i]

            length_of_beam = 0
            length_of_beam += beam_spans[i].span_length
            p = beam_spans[i].load
            l = beam_spans[i].span_length
            if beam_spans[i].loading_condition == 'P_C':
                beam_spans[i].right_fem = (p * l) / 8
                beam_spans[i].left_fem = -1 * beam_spans[i].right_fem

            elif beam_spans[i].loading_condition == 'P_X':
                beam_spans[i].span_a_value = int(input("distance from point load to the left end joint"))
                a = beam_spans[i].span_a_value
                b = beam_spans[i].span_length - a
                beam_spans[i].right_fem = (p * b * a * a) / (l * l)
                beam_spans[i].left_fem = (p * b * b * a) / (l * l)

            elif beam_spans[i].loading_condition == 'P_C_2':
                beam_spans[i].right_fem = (2 * p * l) / 9
                beam_spans[i].left_fem = -1 * beam_spans[i].right_fem

            elif beam_spans[i].loading_condition == 'P_C_3':
                beam_spans[i].right_fem = (15 * p * l) / 48
                beam_spans[i].left_fem = -1 * beam_spans[i].right_fem

            elif beam_spans[i].loading_condition == 'UDL':
                beam_spans[i].right_fem = (p * l * l) / 12
                beam_spans[i].left_fem = -1 * beam_spans[i].right_fem

            elif beam_spans[i].loading_condition == 'UDL/2_R':
                beam_spans[i].right_fem = (11 * p * l * l) / 192
                beam_spans[i].left_fem = -1 * (5 * p * l * l) / 192

            elif beam_spans[i].loading_condition == 'UDL/2_L':
                beam_spans[i].right_fem = (5 * p * l * l) / 192
                beam_spans[i].left_fem = -1 * (11 * p * l * l) / 192

            elif beam_spans[i].loading_condition == 'VDL_R':
                beam_spans[i].right_fem = (p * l * l) / 20
                beam_spans[i].left_fem = -1 * (p * l * l) / 30

            elif beam_spans[i].loading_condition == 'VDL_L':
                beam_spans[i].right_fem = (p * l * l) / 30
                beam_spans[i].left_fem = -1 * (p * l * l) / 20

            elif beam_spans[i].loading_condition == 'VDL_C':
                beam_spans[i].right_fem = (5 * p * l * l) / 96
                beam_spans[i].left_fem = -1 * beam_spans[i].right_fem

            elif beam_spans[i].loading_condition == "none":
                beam_spans[i].right_fem = 0
                beam_spans[i].left_fem = 0
                print(f"No loading on span {i+1}")

        # Make all the end span moments sympy symbols, and store them in a list of unknown end moments
        #list_of_end_moments = []
        left_end = "a"
        right_end = "b"    
        for i in range(number_of_spans):
            beam_spans[i].left_moment, beam_spans[i].right_moment = symbols(f"M{left_end}{right_end} M{right_end}{left_end}")
            left_end = chr(ord(left_end) + 1)
            right_end = chr(ord(right_end) + 1)
            list_of_end_moments.append(beam_spans[i].left_moment)
            list_of_end_moments.append(beam_spans[i].right_moment)

        # Get settlement information
        if settlement_on_beam == "no":
            print("No settlement on the beam")
            for node in range(number_of_supports):
                supports[node].settlement = 0
        else:
            for i in range(number_of_settlements):
                position = settlement_positions[i]
                value = settlement_values[i]
                
                supports[position].settlement = value

    def calculate_settlement():
        #determine the value of the delta/L for each span
        for i in range(number_of_spans):
            beam_spans[i].delta = (
                    (supports[i + 1].settlement - supports[i].settlement) / beam_spans[i].span_length)

    # next is to express the two slope deflection equations for each span, and store them in a list
    def slope_deflection_equations():
        # for the slope deflection equations, we need to check if the first and last nodes are fixed
        for i in range(number_of_spans):
            beam_spans[i].moment_of_inertia_multiplier = multipliers[i]
            m_multiplier = beam_spans[i].moment_of_inertia_multiplier
            l = beam_spans[i].span_length
            if i == 0 and first_node_fixed == "no":
                beam_spans[i].left_slope_deflection_equation = Eq(0, beam_spans[i].left_moment)
                beam_spans[i].right_slope_deflection_equation = Eq(
                    (m_multiplier * ((2 * E * I * (2 * supports[i].slope + supports[i + 1].slope - 3 * beam_spans[i].delta)) / l) + beam_spans[i].right_fem), beam_spans[i].right_moment
                )

            elif i == number_of_spans - 1 and last_node_fixed == "no":
                beam_spans[i].left_slope_deflection_equation = Eq(
                    (m_multiplier * ((2 * E * I * (2 * supports[i].slope + supports[i + 1].slope - 3 * beam_spans[i].delta)) / l) + beam_spans[i].left_fem), beam_spans[i].left_moment
                )
                beam_spans[i].right_slope_deflection_equation = Eq(0, beam_spans[i].right_moment)

            else:
                # Include the moment of inertia multiplier in the slope deflection equations
                beam_spans[i].left_slope_deflection_equation = Eq(
                    (m_multiplier * ((2 * E * I * (2 * supports[i].slope + supports[i + 1].slope - 3 * beam_spans[i].delta)) / l) + beam_spans[i].left_fem), beam_spans[i].left_moment
                )
                beam_spans[i].right_slope_deflection_equation = Eq(
                    (m_multiplier * ((2 * E * I * (2 * supports[i + 1].slope + supports[i].slope - 3 * beam_spans[i].delta)) / l) + beam_spans[i].right_fem), beam_spans[i].right_moment
                )
            list_of_slope_deflection_equations.append(beam_spans[i].left_slope_deflection_equation)
            list_of_slope_deflection_equations.append(beam_spans[i].right_slope_deflection_equation)

    def equilibrium_equations():
    #define the equilibrium equations, and store in a list
        for i in range(number_of_supports):
            if i != 0 and i != number_of_supports - 1:
                supports[i].equilibrium_equation = Eq(beam_spans[i - 1].right_moment + beam_spans[i].left_moment, 0)
            else:
                supports[i].equilibrium_equation = 0

            list_of_equilibrium_equations.append(supports[i].equilibrium_equation)

    def calculate():
    #store_values()
        calculate_fem()
        calculate_settlement()
        slope_deflection_equations()
        equilibrium_equations() 
        #solve_unknowns()    

    calculate()
    #store the equations and the unknowns in lists
    equations = list_of_slope_deflection_equations + list_of_equilibrium_equations
    unknowns = list_of_end_moments + list_of_unknown_slopes
    # next is to solve all the equations for the unknown moments and angular displacement
    solution = solve(tuple(equations), tuple(unknowns))
    result_label.config(text=solution)
    print(equations)
    print(solution)
    print(list_of_end_moments)


def simulate():
    calculate_deflection()
    engine()
    result_label.config(text=solution)

root = tk.Tk()
root.title("Slope Deflection Calculator")
root.geometry("800x1080")  # Set the size of the root window

main_frame = tk.Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True)

header_label = tk.Label(main_frame, text="Slope Deflection Calculator", font=("Helvetica", 16))
header_label.grid(row=0, column=0, columnspan=2, sticky="w", padx=10, pady=5)

params_label = tk.Label(main_frame, text="Enter parameters below to calculate")
params_label.grid(row=1, column=0, columnspan=2, sticky="w", padx=10, pady=5)

span_list = tk.Frame(main_frame)
span_list.grid(row=2, column=0, columnspan=2, sticky="ew", padx=10, pady=5)

settlement_list = tk.Frame(main_frame)
settlement_list.grid(row=3, column=0, columnspan=2, sticky="ew", padx=10, pady=5)

add_span_button = tk.Button(main_frame, text="Add new span", command=add_new_span)
add_span_button.grid(row=4, column=0, columnspan=2, sticky="ew", padx=10, pady=5)

spans_count_label = tk.Label(main_frame, text="Number of spans: 0", font=("Helvetica", 10), fg="blue")
spans_count_label.grid(row=5, column=0, columnspan=2, sticky="w", padx=10, pady=5)

settlement_on_beam_label = tk.Label(main_frame, text="Settlement on Beam:")
settlement_on_beam_label.grid(row=6, column=0, sticky="w", padx=10, pady=5)
settlement_on_beam_var = tk.StringVar(value="no")
settlement_on_beam_entry = tk.OptionMenu(main_frame, settlement_on_beam_var, "yes", "no", command=handle_settlement_of_beam_params)
settlement_on_beam_entry.grid(row=6, column=1, sticky="ew", padx=10, pady=5)

first_node_fixed_label = tk.Label(main_frame, text="First Node Fixed:")
first_node_fixed_label.grid(row=7, column=0, sticky="w", padx=10, pady=5)
first_node_fixed_var = tk.StringVar(value="yes")
first_node_fixed_entry = tk.OptionMenu(main_frame, first_node_fixed_var, "yes", "no")
first_node_fixed_entry.grid(row=7, column=1, sticky="ew", padx=10, pady=5)

last_node_fixed_label = tk.Label(main_frame, text="Last Node Fixed:")
last_node_fixed_label.grid(row=8, column=0, sticky="w", padx=10, pady=5)
last_node_fixed_var = tk.StringVar(value="yes")
last_node_fixed_entry = tk.OptionMenu(main_frame, last_node_fixed_var, "yes", "no")
last_node_fixed_entry.grid(row=8, column=1, sticky="ew", padx=10, pady=5)

# Add input fields for e and I
e_label = tk.Label(main_frame, text="Enter value for E:")
e_label.grid(row=9, column=0, sticky="w", padx=10, pady=5)
e_entry = tk.Entry(main_frame)
e_entry.grid(row=9, column=1, sticky="ew", padx=10, pady=5)

i_label = tk.Label(main_frame, text="Enter value for I:")
i_label.grid(row=10, column=0, sticky="w", padx=10, pady=5)
i_entry = tk.Entry(main_frame)
i_entry.grid(row=10, column=1, sticky="ew", padx=10, pady=5)

calculate_button = tk.Button(main_frame, text="CALCULATE", command=simulate)
calculate_button.grid(row=11, column=0, columnspan=2, sticky="ew", padx=10, pady=5)

add_settlement_button = tk.Button(main_frame, text="Add new settlement", command=add_new_settlement)
add_settlement_button.grid(row=12, column=0, columnspan=2, sticky="ew", padx=10, pady=5)

settlements_count_label = tk.Label(main_frame, text="Number of settlements: 0", font=("Helvetica", 10), fg="blue")
settlements_count_label.grid(row=13, column=0, columnspan=2, sticky="w", padx=10, pady=5)

result_label = tk.Label(main_frame, text="", font=("Helvetica", 12))
result_label.grid(row=15, column=0, columnspan=2, sticky="w", padx=10, pady=5)

handle_settlement_of_beam_params(None)  # Call to initially hide settlement options

root.mainloop()
