# distutils: language = c++
# cython: language_level=3

from libcpp.vector cimport vector
from libcpp.string cimport string

cdef extern from "multi-objective-astar.hpp":
    cdef struct Path:
        string name
        int idx
        vector[int] path
        double time
        double dark

    vector[Path] solve(int N, int M, const vector[double]& light, const vector[int]& crime,
                       const vector[vector[int]]& input, int s, int t)

def run_astar_solver(int N, int M, list light_py, list crime_py, list input_py, int s, int t):
    """
    A Python wrapper for the C++ multi-objective A* solver.

    Args:
        N (int): Number of nodes.
        M (int): Number of edges.
        light_py (list[float]): List of light values for each node.
        crime_py (list[int]): List of crime flags (0 or 1) for each node.
        input_py (list[list[int]]): List of edges, where each edge is [u, v, time_cost].
        s (int): Start node index.
        t (int): Target node index.

    Returns:
        list[dict]: A list of dictionaries, each representing a found path.
    """
    cdef vector[double] light_cpp = light_py
    cdef vector[int] crime_cpp = crime_py
    cdef vector[vector[int]] input_cpp = input_py

    cdef vector[Path] result_cpp = solve(N, M, light_cpp, crime_cpp, input_cpp, s, t)

    py_results = []
    for path in result_cpp:
        py_results.append({
            'name': path.name.decode('utf-8'),
            'path': list(path.path),
            'time': path.time,
            'dark': path.dark
        })

    return py_results