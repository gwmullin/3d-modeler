import cadquery as cq
import tempfile
import os
import io

# Safe execution dictionary
SAFE_LOCALS = {}
SAFE_GLOBALS = {
    "cq": cq,
    "cadquery": cq,
    "print": print,
    "range": range,
    "len": len,
    "float": float,
    "int": int,
    "str": str,
    "list": list,
    "tuple": tuple,
    "dict": dict,
    "abs": abs,
    "min": min,
    "max": max,
    "pow": pow,
    "round": round,
    "sorted": sorted,
    "sum": sum,
    "enumerate": enumerate,
    "zip": zip,
}
# Allow math module
import math
SAFE_GLOBALS["math"] = math

import sys
import traceback

class CadQueryExecutionError(Exception):
    def __init__(self, message, line_number=None):
        super().__init__(message)
        self.line_number = line_number

def execute_cadquery(code_str: str):
    """
    Executes the CadQuery code and returns the GLB bytes and the result object.
    """
    # Use a copy of SAFE_GLOBALS as the single execution scope.
    # This ensures that functions defined in the executed code can see variables defined in the execution scope.
    execution_scope = SAFE_GLOBALS.copy()
    
    print(f"--- [DEBUG] Evaluating CadQuery Code ---\n{code_str}\n--------------------------------------")

    try:
        exec(code_str, execution_scope)
    except Exception as e:
        full_tb = traceback.format_exc()
        print(f"--- [DEBUG] Error: {full_tb} ---")
        # Extract line number from traceback
        cl, exc, tb = sys.exc_info()
        line_number = None
        # Walk traceback to find the frame corresponding to <string> (our code)
        for frame in traceback.extract_tb(tb):
            if frame.filename == "<string>":
                line_number = frame.lineno
        
        error_msg = f"Execution Error on line {line_number}: {str(e)}" if line_number else f"Execution Error: {str(e)}"
        raise CadQueryExecutionError(error_msg, line_number)
    
    if "result" not in execution_scope:
        raise ValueError("The code did not produce a 'result' variable.")
    
    result = execution_scope["result"]
    
    # Export to GLTF (GLB)
    with tempfile.NamedTemporaryFile(suffix=".glb", delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        # Check if Assembly or Workplane
        if isinstance(result, cq.Assembly):
            result.export(tmp_path, "GLTF")
        elif isinstance(result, cq.Workplane):
             # For Workplane, often needs to be converted to assembly for GLTF export 
             # or use assembly wrapping
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")
        elif isinstance(result, cq.Shape):
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")
        else:
             # Try generic export or fail
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")

        with open(tmp_path, "rb") as f:
            glb_data = f.read()
            
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
    return glb_data, result

def export_stl(result_obj) -> str:
    """Exports result to STL file and returns path."""
    with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as tmp:
        path = tmp.name
    
    # STL export usually works on Workplane or Shapes. 
    # Logic to extract shape if it's an assembly or just export whatever possible
    try:
        if isinstance(result_obj, cq.Assembly):
             # Assembly export to STL is tricky, usually needs component iteration or distinct file
             # CadQuery 2.x Assembly export to STL might assume single merged solid for stl
             result_obj.save(path, "STL")
        else:
             cq.exporters.export(result_obj, path, "STL")
    except Exception as e:
        # Fallback or specific error
        raise ValueError(f"STL Export Error: {e}")
        
    return path
