from typing import Optional, List, Tuple, Literal, Union
import numpy as np
from sympy import Eq, solve, symbols
from analysis import calculate_fem_for_span

# Create a beam_data array
beam_data = []


class Beam:
    """
    Beam class
    """

    def __init__(self,
                 length: float,
                 nodes: List[Tuple[str, float, float]],
                 loads: List[Tuple[str, float, float, float]]) -> None:
        """
        Constructs a beam object

        Parameters
        ----------
        length: float
          Length of the beam
        nodes: List[Tuple[str, float, float]]
          List of nodes(free ends and supports)
        loads: List[Tuple[str, float, float, float]]
          List of loads
        """
        self.length = length
        self.nodes = nodes
        self.loads = loads

    def number_of_spans(self) -> int:
        """
        Returns the number of beam_spans
        """
        return len(self.nodes) - 1

    def __str__(self):
        return f'{self.length} {self.nodes} {self.loads}'

    def __repr__(self):
        return f'{self.length} {self.nodes} {self.loads}'


# Request input from user
beam_length = float(input("Enter Beam Length: "))
number_of_nodes = int(input("Enter number of nodes: "))
number_of_supports = int(input("Enter number of supports: "))
number_of_spans = number_of_nodes - 1

# if free end is present
cantilever_option = input("Is free end present? (yes, no): ")

# Request number of free ends
if cantilever_option == "yes":
    no_of_free_ends = int(input("Enter number of free ends: "))
    if no_of_free_ends == 1:
        number_of_spans = number_of_supports + 1
    elif no_of_free_ends == 2:
        number_of_spans = number_of_supports + 2

# Add information to Beam Data
beam_data.extend([beam_length, number_of_supports])

# Node & Support Information
print("\n______Support Conditions______\n")

# Request support types from user
supports_list = []  # A list of supports (support_type, position, settlement)
node_types = ["fixed", "pin", "roller", "free"]
NodeType = Literal["fixed", "pin", "roller", "free"]  # A node may contain a support or a free end


class Node:
    """
    A class to represent a node
    """

    def __init__(self,
                 n_type: str,
                 position: float,
                 settlement: Optional[float] = 0.0,
                 angular_displacement: Optional[Union[float, str]] = '',
                 equilibrium_equation: Optional[str] = ''
                 ):

        self.n_type = n_type
        self.position = position
        self.settlement = settlement
        self.angular_displacement = angular_displacement
        self.equilibrium_equation = equilibrium_equation

    @staticmethod
    def __validate_type(type: str):
        if type not in node_types:
            raise ValueError("Invalid support type")

    def change_angular_displacement(self):
        if self.n_type == "fixed":
            angular_displacement = 0.0
        else:
            angular_displacement = ''
        setattr(self, angular_displacement, 0.0)

    def __str__(self):
        return f'{self.n_type} {self.position} {self.settlement}'

    def __repr__(self):
        return f'{self.n_type} {self.position} {self.settlement}'


class Support(Node):  # A support is a node
    """
    A class to represent a support
    """

    def __init__(self, n_type: str, position: float, settlement: float, angular_displacement: Optional[float] = 0.0):
        super().__init__(n_type, position, settlement, angular_displacement)

    def __str__(self):
        return f'{self.n_type} {self.position} {self.settlement}'

    def __repr__(self):
        return f'{self.n_type} {self.position} {self.settlement}'


# Store all node objects in a list
beam_nodes = []

if number_of_nodes:
    for i in range(number_of_nodes):
        node_type = input("Node {0} type (fixed, pin, roller, free): ".format(i + 1))
        node_position = float(input("Node {0} position (from the left end): ".format(i + 1)))
        node_settlement = float(input("Settlement: "))

        # Instantiate a node
        node = Node(node_type, node_position, node_settlement)

        # Append to nodes_list
        assert isinstance(node, object)
        beam_nodes.append(node)

# Instantiate the support class from the node_list
for node in beam_nodes:
    if node.n_type != "free":
        support = Support(node.n_type, node.position, node.settlement, node.angular_displacement)
        supports_list.append(support)

# Make all the unknown angular displacements sympy symbols, and store them in a list, first and last are always = 0
# Except if cantilever_option is "yes" and no_of_free_ends is 1 or 2

list_of_unknown_angular_displacements = []
first_node = "A"
for i in range(number_of_nodes):
    if (i != 0 and i != number_of_nodes - 1) and beam_nodes[i].n_type != "fixed":
        beam_nodes[i].angular_displacement = symbols(f"Theta_{first_node}")
        list_of_unknown_angular_displacements.append(beam_nodes[i].angular_displacement)

    elif (i == 0 or i == number_of_nodes - 1) and beam_nodes[i].n_type in ["pin", "roller"]:
        beam_nodes[i].angular_displacement = symbols(f"Theta_{first_node}")
        list_of_unknown_angular_displacements.append(beam_nodes[i].angular_displacement)

    elif (i == 0 or i == number_of_nodes - 1) and beam_nodes[i].n_type == "fixed":
        beam_nodes[i].angular_displacement = 0.0

    first_node = chr(ord(first_node) + 1)


print("\n______Loading Conditions______\n")

# Request load types from user
num_loads = int(input("Total Number of loads: "))
load_types = ["point", "udl", "moment"]
loads_list = []  # list of Lists (load_type, load_magnitude, load_position, load_coverage)


class Load:
    """
    A class to represent a load
    """

    def __init__(self,
                 l_type: str,
                 magnitude: float,
                 position: float,
                 coverage: Optional[float] = 0.0
                 ):
        self.l_type = l_type
        self.magnitude = magnitude
        self.position = position
        self.coverage = coverage

    @staticmethod
    def __validate_type(type: str):
        if type not in load_types:
            raise ValueError("Invalid load type")

    def __str__(self):
        return f'{self.l_type} {self.magnitude} {self.position} {self.coverage}'

    def __repr__(self):
        return f'{self.l_type} {self.magnitude} {self.position} {self.coverage}'


# Instantiate Load class with all loads on the beam
if num_loads:
    for i in range(num_loads):
        load_type = input("Load {0} type (point, udl, moment): ".format(i + 1))
        load_magnitude = float(input("Magnitude of Load: "))
        load_position = float(input("Position of Load: "))

        if load_type == "udl":
            load_coverage = input("Enter span of udl: ")
        else:
            load_coverage = 0.0

        load = Load(load_type, load_magnitude, load_position, load_coverage)

        # Append to loads_list
        loads_list.append(load)


# Parse the beam span by creating a Span class with its attributes.
class Span:
    """
    Span class
    """

    def __init__(
            self,
            index: int,
            start_node: Node,
            end_node: Node,
            EI: float,
            S: Tuple[Support, Support],
            rotations=None,
            end_moments=None,
            reactions=None,
            slope_deflection_equations=None,
            moment_equations=None,
            equilibrium_equations=None

    ) -> None:
        """
    Constructs a span object

    Parameters
    ----------
    EI: np.float64
      Flexural rigidity of the span
    S: np.ndarray
      Support matrix.
    rotations: Optional[Tuple[float, float]]
        Rotation (default is (0, 0))
    end_moments: Optional[Tuple[float, float]]
        Moments (default is (0, 0))
    reactions: Optional[Tuple[float, float]]
        Reactions (default is (0, 0))
    """

        # if EI <= 0:
        #     raise ValueError('Flexural rigidity of the span must be greater than 0')
        #
        # if not isinstance(S, tuple):
        #     raise TypeError('Support matrix must be a tuple')
        #
        # if len(S) != 2:
        #     raise ValueError('Support matrix must have 2 elements')
        #
        # if not isinstance(S[0], str) or not isinstance(S[1], str):
        #     raise TypeError('Support matrix elements must be strings')
        #
        # if S[0] not in node_types or S[1] not in node_types:
        #     raise ValueError(f'Invalid support type: must be one of {node_types}')

        if equilibrium_equations is None:
            equilibrium_equations = ['0', '0']
        if moment_equations is None:
            moment_equations = ['', '']
        if slope_deflection_equations is None:
            slope_deflection_equations = ['', '']
        if reactions is None:
            reactions = ['0', '0']
        if end_moments is None:
            end_moments = ['0', '0']
        if rotations is None:
            rotations = ['0', '0']

        self.index = index
        self.start_node = start_node
        self.end_node = end_node
        self.EI = EI
        self.S = S
        self.rotations = rotations  # Unknown rotations at each end
        self.end_moments = end_moments  # Unknown end_moments at each end
        self.reactions = reactions  # Unknown reactions at each end
        self.slope_deflection_equations = slope_deflection_equations
        self.moment_equations = moment_equations
        self.equilibrium_equations = equilibrium_equations

    def __str__(self):
        return f'Span - {self.index}'

    @property
    def length(self) -> float:
        """
        Returns the length of the span
        """
        return self.end_node.position - self.start_node.position

    @property
    def boundary_conditions(self) -> Tuple[float, float]:
        """
        Returns the boundary conditions of the span
        """
        return self.start_node.position, self.end_node.position

    @property
    def settlements(self) -> Tuple[float, float]:
        """
        Returns the settlement of the span at its ends
        """
        return self.S[0].settlement, self.S[1].settlement

    @property
    def cord_rotation(self) -> float:
        """
        Returns the cord rotation of the span
        """
        return (self.end_node.angular_displacement - self.start_node.angular_displacement) / self.length

    @property
    def loads_within_span(self):
        """
        Extracts the loads that fall within the span.
        """
        loads_within_span = []
        for loading in loads_list:
            if self.start_node.position <= loading.position < self.end_node.position:
                loads_within_span.append(loading)
        return loads_within_span

    @property
    def fixed_end_moments(self) -> tuple[float, float]:
        """
        Calculates the fixed end end_moments for the span.
        """
        loads = self.loads_within_span
        fem_left, fem_right = calculate_fem_for_span(self.boundary_conditions, loads)

        return fem_left, fem_right


# Instantiate the Span class and store all beam_spans in a list.
print("\n______Span Analysis______\n")
beam_spans = []
if number_of_spans > 0:
    for i in range(number_of_spans):
        EI = float(input('Coefficient of EI of span{0}: '.format(i + 1)))
        span = Span(i + 1, beam_nodes[i], beam_nodes[i + 1], EI, (supports_list[i], supports_list[i + 1]))
        beam_spans.append(span)

# Add all fems for eah span to a list of tuples
list_of_fems = []
for i in range(number_of_spans):
    list_of_fems.append(beam_spans[i].fixed_end_moments)

print("\n______Fixed End Moments______\n")
for i in range(number_of_spans):
    print(f"Span {i + 1}: {list_of_fems[i]}")

# Make all the span end moments sympy symbols, and store them in a list of unknown end_moments
list_of_end_moments = []
left_end = "a"
right_end = "b"
for i in range(number_of_spans):
    beam_spans[i].end_moments[0] = symbols(f"M{left_end}{right_end}")
    beam_spans[i].end_moments[1] = symbols(f"M{right_end}{left_end}")
    left_end = chr(ord(left_end) + 1)  # Increment the left end
    right_end = chr(ord(right_end) + 1)  # Increment the right end
    list_of_end_moments.append(beam_spans[i].end_moments[0])
    list_of_end_moments.append(beam_spans[i].end_moments[1])

# next is to express the two slope deflection equations for each span, and store them in a list
list_of_slope_deflection_equations = []

for i in range(number_of_spans):
    if i == 0 and beam_spans[i].start_node.n_type != "fixed":  # If the first node is not fixed
        beam_spans[i].slope_deflection_equations[0] = Eq(0, beam_spans[i].end_moments[0])
        beam_spans[i].slope_deflection_equations[1] = \
            Eq(
                (2 * (beam_spans[i].EI / beam_spans[i].length) *
                 (3 * beam_spans[i].cord_rotation + 2 * beam_nodes[i+1].angular_displacement + beam_nodes[i].angular_displacement)
                 + beam_spans[i].fixed_end_moments[1]), beam_spans[i].end_moments[1])

    elif i == number_of_spans - 1 and beam_spans[i].end_node.n_type != "fixed":  # If the last node is not fixed
        beam_spans[i].slope_deflection_equations[0] = \
            Eq(
                (2 * (beam_spans[i].EI / beam_spans[i].length) *
                 ((3 * beam_spans[i].cord_rotation) + beam_nodes[i+1].angular_displacement + (2 * beam_nodes[i].angular_displacement))
                 + beam_spans[i].fixed_end_moments[0]), beam_spans[i].end_moments[0])
        beam_spans[i].slope_deflection_equations[1] = Eq(0, beam_spans[i].end_moments[1])

    else:  # For intermediate spans
        beam_spans[i].slope_deflection_equations[0] = \
            Eq((beam_spans[i].fixed_end_moments[0] + (2 * beam_spans[i].EI / beam_spans[i].length) *
                ((2 * beam_nodes[i].angular_displacement) + beam_nodes[i+1].angular_displacement -
                 (3 * beam_spans[i].cord_rotation))), beam_spans[i].end_moments[0])

        beam_spans[i].slope_deflection_equations[1] = \
            Eq((beam_spans[i].fixed_end_moments[1] + (2 * beam_spans[i].EI / beam_spans[i].length) *
                ((2 * beam_nodes[i+1].angular_displacement) + beam_nodes[i].angular_displacement -
                 (3 * beam_spans[i].cord_rotation))), beam_spans[i].end_moments[1])

    list_of_slope_deflection_equations.extend([
        beam_spans[i].slope_deflection_equations[0], beam_spans[i].slope_deflection_equations[1]
    ])

# next is to define the equilibrium equations, and store it in a list
list_of_equilibrium_equations = []
for i in range(number_of_nodes):
    if i != 0 and i != number_of_nodes - 1:  # For intermediate nodes
        beam_nodes[i].equilibrium_equation = Eq(beam_spans[i - 1].end_moments[1] + beam_spans[i].end_moments[0], 0)
    else:
        beam_nodes[i].equilibrium_equation = 0

    list_of_equilibrium_equations.append(beam_nodes[i].equilibrium_equation)

# store the equations and the unknowns in lists
equations = list_of_slope_deflection_equations + list_of_equilibrium_equations
unknowns = list_of_end_moments + list_of_unknown_angular_displacements

# next is to solve all the equations for the unknown moments and angular displacement
solution = solve(tuple(equations), tuple(unknowns))

# print the results
print("\n______Slope Deflection Analysis______\n")
print(equations)
print('\n')
print(solution)
print('\n')
for i in range(number_of_spans):
    print(solution[beam_spans[i].end_moments[0]])
print(list_of_end_moments)

print("\n______Results______\n")
print("The end moments for each span are: ")
for i in range(number_of_spans):
    print(f"Span {i + 1}: {solution[beam_spans[i].end_moments[0]]}, {solution[beam_spans[i].end_moments[1]]}")


