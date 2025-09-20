from setuptools import setup, Extension
from Cython.Build import cythonize
import os

# Define the C++ extension module
extension = Extension(
    # This is the name of the module as it will be imported in Python,
    # e.g., from algorithm.astar_solver import run_astar_solver
    name="algorithm.astar_solver",
    
    # List of source files to compile.
    # This includes the Cython wrapper and the C++ implementation file.
    sources=[
        "algorithm/astar_wrapper.pyx",
        "algorithm/multi-objective-astar.cpp"
    ],
    
    # Specify that this is a C++ extension
    language="c++",
    
    # Add the directory containing the .hpp header file to the include path
    include_dirs=[os.path.abspath("algorithm")],
    
    # Pass compiler arguments. -std=c++17 is important for modern C++ features.
    extra_compile_args=["-std=c++17", "-O3"], # -O3 for optimization
    extra_link_args=["-std=c++17"],
)

# Use setuptools to build the extension module
setup(
    name="AstarSolver",
    ext_modules=cythonize(
        [extension],
        compiler_directives={'language_level': "3"} # Use Python 3 syntax
    ),
)
